/**
 * Iran Gate — Digikala In-App Purchase Browser Screen
 *
 * Allows customers to browse Digikala directly inside the app,
 * automatically translates the page to Arabic (or English),
 * detects product pages (URL pattern: /product/dkp-{ID}/...),
 * captures a viewport screenshot, and provides a verification pop-up
 * before submitting or routing to the order creation form.
 */

import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  BackHandler,
  useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation, type WebViewMessageEvent } from 'react-native-webview';
import { captureRef } from 'react-native-view-shot';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows, TextStyles } from '@/theme';
import { Button } from '@/components/ui/Button';
import { orderService } from '@/services/orderService';
import { getErrorMessage } from '@/utils/formatters';

/**
 * FLOW CONFIGURATION:
 * When `true`:  User confirms -> navigates to CreateOrderScreen with pre-filled fields.
 * When `false`: User confirms -> auto-submits order (status PENDING_QUOTATION) -> navigates to orders list.
 */
export const NAVIGATE_TO_CREATE_ORDER = false;

// Default translation language: Arabic ('ar')
// TODO: Integrate with user language preference store when available
const USER_LANGUAGE = 'ar';

// Digikala base URL
const DIGIKALA_BASE_URL = 'https://www.digikala.com';

// Product URL detector: /product/dkp-{ID}/...
const PRODUCT_URL_REGEX = /\/product\/dkp-\d+/i;

export default function DigikalaBrowserScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // References
  const webViewRef = useRef<WebView>(null);
  const captureContainerRef = useRef<View>(null);

  // Browser state
  const [currentUrl, setCurrentUrl] = useState(DIGIKALA_BASE_URL);
  const [pageTitle, setPageTitle] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loading, setLoading] = useState(true);

  // Screenshot & Verification Modal state
  const [isCapturing, setIsCapturing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  const [orderTitle, setOrderTitle] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Check if current page is a product page
  const isProductPage = useMemo(() => {
    return PRODUCT_URL_REGEX.test(currentUrl);
  }, [currentUrl]);

  /**
   * Android hardware back button handler:
   * Navigates back inside WebView history if possible,
   * closes modal if open, otherwise exits screen.
   */
  useEffect(() => {
    const handleHardwareBackPress = () => {
      if (modalVisible) {
        if (!submittingOrder) {
          setModalVisible(false);
        }
        return true;
      }
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false; // Propagate to default navigation back
    };

    const backSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleHardwareBackPress
    );

    return () => backSubscription.remove();
  }, [canGoBack, modalVisible, submittingOrder]);

  /**
   * Injected script executed before content load to set Google Translate cookies
   * and override window.open to keep all navigations inside this WebView.
   */
  const injectedCookieJS = useMemo(() => {
    return `
      (function() {
        // Set Google Translate cookies
        document.cookie = "googtrans=/fa/${USER_LANGUAGE}; path=/;";
        document.cookie = "googtrans=/fa/${USER_LANGUAGE}; domain=.digikala.com; path=/;";

        // Override window.open so links open in the same WebView instead of external browser (Chrome)
        window.open = function(url) {
          if (url) {
            location.href = url;
          }
          return window;
        };
      })();
      true;
    `;
  }, []);

  /**
   * Injected JavaScript for SPA Navigation Tracking, Translated Title extraction,
   * Google Translate injection, opening links in same window, and UI cleanup.
   */
  const injectedSPAObserverJS = useMemo(() => {
    return `
      (function() {
        // 1. Override window.open & link targets so all links stay inside the app WebView
        window.open = function(url) {
          if (url) { location.href = url; }
          return window;
        };

        document.addEventListener('click', function(e) {
          var target = e.target.closest && e.target.closest('a');
          if (target) {
            if (target.getAttribute('target') === '_blank') {
              target.removeAttribute('target');
            }
          }
        }, true);

        // 2. Google Translate script injection
        if (!document.getElementById('gt-script')) {
          var s = document.createElement('script');
          s.id = 'gt-script';
          s.src = 'https://translate.google.com/translate_a/element.js?cb=gtInit';
          document.body.appendChild(s);
          window.gtInit = function() {
            try {
              new google.translate.TranslateElement({
                pageLanguage: 'fa',
                includedLanguages: '${USER_LANGUAGE}',
                autoDisplay: false
              }, 'google_translate_element');
            } catch(e) {}
          };
        }

        // 3. Hide intrusive app banners, popups, and translate toolbar
        var style = document.createElement('style');
        style.innerHTML = \`
          .goog-te-banner-frame, .skiptranslate, #goog-gt-tt { display: none !important; }
          body { top: 0px !important; }
          [class*="AppBar"], [class*="app-banner"], [class*="cookie"],
          [data-testid="header-banner"], .swiper-download-app { display: none !important; }
        \`;
        document.head.appendChild(style);

        // 4. Helper to extract translated title from rendered DOM (h1 gets translated by Google Translate)
        function extractTranslatedTitle() {
          var h1 = document.querySelector('h1');
          if (h1 && h1.innerText && h1.innerText.trim()) {
            return h1.innerText.trim();
          }
          var pTitle = document.querySelector('[data-component-name="ProductTitle"], [data-testid="product-title"], .product-title');
          if (pTitle && pTitle.innerText && pTitle.innerText.trim()) {
            return pTitle.innerText.trim();
          }
          return document.title || '';
        }

        // 5. SPA Route and Title Observer
        var currentHref = location.href;
        var currentTitle = extractTranslatedTitle();

        function notifyNavChange() {
          var href = location.href;
          var title = extractTranslatedTitle();
          if (href !== currentHref || title !== currentTitle) {
            currentHref = href;
            currentTitle = title;
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'NAV_CHANGE',
                url: currentHref,
                title: currentTitle
              }));
            }
          }
        }

        setInterval(notifyNavChange, 400);
        window.addEventListener('popstate', notifyNavChange);
        window.addEventListener('hashchange', notifyNavChange);
        notifyNavChange();
      })();
      true;
    `;
  }, []);

  // Handle messages posted from injected JS in WebView
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'NAV_CHANGE') {
        if (data.url) {
          setCurrentUrl(data.url);
        }
        if (data.title) {
          setPageTitle(data.title);
        }
      }
    } catch {
      // Ignore non-JSON messages
    }
  }, []);

  // Handle standard navigation state changes
  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setLoading(navState.loading);
    if (navState.url) {
      setCurrentUrl(navState.url);
    }
    if (navState.title) {
      setPageTitle((prev) => prev || navState.title);
    }
  }, []);

  /**
   * Helper to clean up raw HTML title
   */
  const getCleanProductTitle = (rawTitle: string): string => {
    if (!rawTitle) return 'Digikala Product';
    return rawTitle
      .replace(/قیمت و خرید/g, '')
      .replace(/\| دیجی‌کالا/g, '')
      .replace(/\| Digikala/gi, '')
      .replace(/سعر وشراء/g, '')
      .trim();
  };

  /**
   * "Order This Product" tap handler:
   * 1. Injects JS to get the latest translated h1 text from DOM
   * 2. Captures screenshot of viewport via react-native-view-shot
   * 3. Opens verification popup with preview, editable title, and quantity
   */
  const handleOrderPress = async () => {
    if (!isProductPage) return;

    try {
      setIsCapturing(true);

      // Snapshot the WebView viewport
      const target = captureContainerRef.current || webViewRef.current;
      if (!target) {
        throw new Error('Screenshot target not available');
      }

      const uri = await captureRef(target, {
        format: 'png',
        quality: 0.85,
        result: 'tmpfile',
      });

      // Request latest translated h1 from WebView
      webViewRef.current?.injectJavaScript(`
        (function() {
          var h1 = document.querySelector('h1');
          var title = (h1 && h1.innerText && h1.innerText.trim()) || document.title;
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'NAV_CHANGE',
            url: location.href,
            title: title
          }));
        })();
        true;
      `);

      setScreenshotUri(uri);
      setOrderTitle(getCleanProductTitle(pageTitle));
      setQuantity(1);
      setModalVisible(true);
    } catch (error) {
      Alert.alert('Screenshot Error', 'Failed to capture product preview. ' + getErrorMessage(error));
    } finally {
      setIsCapturing(false);
    }
  };

  /**
   * Confirm order submission from popup modal
   */
  const handleConfirmOrder = async () => {
    if (!screenshotUri) return;

    const baseTitle = orderTitle.trim() || 'Digikala Product';
    const finalDescription = `Quantity: ${quantity}`;

    if (NAVIGATE_TO_CREATE_ORDER) {
      // Mode A: Navigate to CreateOrderScreen with pre-filled parameters
      setModalVisible(false);
      router.push({
        pathname: '/orders/create',
        params: {
          sourceUrl: currentUrl,
          screenshotUri: screenshotUri,
          title: baseTitle,
          quantity: String(quantity),
        },
      });
      return;
    }

    // Mode B (Default): Auto-submit order directly
    try {
      setSubmittingOrder(true);

      // 1. Upload screenshot to storage
      const uploadedImageUrl = await orderService.uploadImage(screenshotUri);

      // 2. Submit new order request
      const response = await orderService.create({
        title: baseTitle,
        source_url: currentUrl,
        quantity: quantity,
        description: finalDescription,
        image_urls: [uploadedImageUrl],
      });

      setModalVisible(false);

      Alert.alert(
        'Order Submitted Successfully!',
        `Your purchase request (${quantity} item${quantity > 1 ? 's' : ''}) has been submitted with status PENDING_QUOTATION. Our team will verify the price and provide a quotation.`,
        [
          {
            text: 'View Order',
            onPress: () => router.replace(`/orders/${response.data.id}`),
          },
          {
            text: 'My Orders',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Order Submission Failed', getErrorMessage(error));
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Browser Bar */}
      <View style={[styles.headerBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={[styles.urlBar, { backgroundColor: colors.surfaceSecondary }]}>
          <Ionicons
            name={isProductPage ? 'cart' : 'globe-outline'}
            size={16}
            color={isProductPage ? colors.success : colors.icon}
          />
          <Text style={[styles.urlText, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
            {currentUrl.replace('https://www.', '')}
          </Text>
          {isProductPage && (
            <View style={[styles.detectedBadge, { backgroundColor: colors.successLight }]}>
              <Text style={[styles.detectedBadgeText, { color: colors.success }]}>Product</Text>
            </View>
          )}
        </View>

        {/* Browser Nav Controls */}
        <View style={styles.navControls}>
          <TouchableOpacity
            style={[styles.navButton, !canGoBack && styles.disabledNavButton]}
            onPress={() => webViewRef.current?.goBack()}
            disabled={!canGoBack}
          >
            <Ionicons name="chevron-back" size={20} color={canGoBack ? colors.text : colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, !canGoForward && styles.disabledNavButton]}
            onPress={() => webViewRef.current?.goForward()}
            disabled={!canGoForward}
          >
            <Ionicons name="chevron-forward" size={20} color={canGoForward ? colors.text : colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={() => webViewRef.current?.reload()}>
            <Ionicons name="reload" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main WebView Viewport */}
      <View
        ref={captureContainerRef}
        collapsable={false}
        style={styles.webViewContainer}
      >
        <WebView
          ref={webViewRef}
          source={{ uri: DIGIKALA_BASE_URL }}
          injectedJavaScriptBeforeContentLoaded={injectedCookieJS}
          injectedJavaScript={injectedSPAObserverJS}
          onMessage={handleMessage}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => {
            setLoading(false);
            webViewRef.current?.injectJavaScript(injectedSPAObserverJS);
          }}
          // Keep all navigations within the WebView (avoid opening in Chrome)
          setSupportMultipleWindows={false}
          onShouldStartLoadWithRequest={(request) => {
            // Allow all web requests to load inside the WebView
            return true;
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsBackForwardNavigationGestures={true}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
          originWhitelist={['*']}
          allowsInlineMediaPlayback={true}
          userAgent={
            Platform.OS === 'android'
              ? 'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36'
              : 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1'
          }
          style={styles.webView}
        />

        {/* Loading Progress Bar */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </View>

      {/* Floating CTA: Order This Product */}
      <View
        style={[
          styles.floatingCtaContainer,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.md,
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        <View style={styles.ctaStatusRow}>
          <View style={styles.statusIndicator}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isProductPage ? colors.success : colors.textTertiary },
              ]}
            />
            <Text style={[styles.statusText, { color: isProductPage ? colors.success : colors.textSecondary }]}>
              {isProductPage ? 'Product page detected' : 'Browse to any product page'}
            </Text>
          </View>

          <View style={styles.langIndicator}>
            <MaterialCommunityIcons name="translate" size={14} color={colors.icon} />
            <Text style={[styles.langText, { color: colors.textSecondary }]}>
              Auto-translated to Arabic
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.ctaButton,
            {
              backgroundColor: isProductPage ? '#EF394E' : colors.surfaceSecondary,
              opacity: isProductPage ? 1 : 0.6,
            },
          ]}
          onPress={handleOrderPress}
          disabled={!isProductPage || isCapturing}
          activeOpacity={0.8}
        >
          {isCapturing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons
                name="bag-check"
                size={22}
                color={isProductPage ? '#fff' : colors.textTertiary}
              />
              <Text
                style={[
                  styles.ctaButtonText,
                  { color: isProductPage ? '#fff' : colors.textTertiary },
                ]}
              >
                Order This Product
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Verification Pop-up Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !submittingOrder && setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Confirm Purchase Request
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => !submittingOrder && setModalVisible(false)}
                disabled={submittingOrder}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={colors.icon} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <Text style={[styles.modalSubtext, { color: colors.textSecondary }]}>
                Are you sure you want to order this product? We captured the screenshot and product URL for you.
              </Text>

              {/* Screenshot Preview Card */}
              <View style={[styles.previewCard, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}>
                {screenshotUri && (
                  <Image
                    source={{ uri: screenshotUri }}
                    style={styles.previewImage}
                    contentFit="contain"
                  />
                )}
                <View style={[styles.previewBadge, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
                  <Ionicons name="camera" size={12} color="#fff" />
                  <Text style={styles.previewBadgeText}>Auto-captured screenshot</Text>
                </View>
              </View>

              {/* Product Title Input (Editable) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Product Title (Translated & Editable)
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: colors.text,
                      backgroundColor: colors.surfaceSecondary,
                      borderColor: colors.border,
                    },
                  ]}
                  value={orderTitle}
                  onChangeText={setOrderTitle}
                  placeholder="Enter product title..."
                  placeholderTextColor={colors.placeholder}
                  multiline={true}
                  numberOfLines={2}
                />
              </View>

              {/* Quantity Stepper Selector */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Quantity
                </Text>
                <View
                  style={[
                    styles.quantityContainer,
                    {
                      backgroundColor: colors.surfaceSecondary,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.quantityLabelText, { color: colors.text }]}>
                    Select item quantity:
                  </Text>
                  <View style={styles.stepperWrapper}>
                    <TouchableOpacity
                      style={[
                        styles.stepperBtn,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || submittingOrder}
                    >
                      <Ionicons
                        name="remove"
                        size={18}
                        color={quantity <= 1 ? colors.textTertiary : colors.text}
                      />
                    </TouchableOpacity>

                    <View style={styles.quantityNumberBox}>
                      <Text style={[styles.quantityNumberText, { color: colors.text }]}>
                        {quantity}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.stepperBtn,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => setQuantity((q) => q + 1)}
                      disabled={submittingOrder}
                    >
                      <Ionicons name="add" size={18} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Product URL (Locked) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Source URL
                </Text>
                <View
                  style={[
                    styles.urlBox,
                    {
                      backgroundColor: colors.surfaceSecondary,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Ionicons name="link" size={16} color={colors.icon} />
                  <Text style={[styles.urlBoxText, { color: colors.textSecondary }]} numberOfLines={2}>
                    {currentUrl}
                  </Text>
                </View>
              </View>

              {/* Info Note */}
              <View style={[styles.modalInfoBox, { backgroundColor: colors.infoLight, borderColor: colors.info }]}>
                <Ionicons name="information-circle" size={18} color={colors.info} />
                <Text style={[styles.modalInfoText, { color: colors.info }]}>
                  Our team will verify the landed cost (product price + shipping + customs) and provide you with a quote.
                </Text>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setModalVisible(false)}
                disabled={submittingOrder}
                style={styles.modalCancelBtn}
              />
              <Button
                title={submittingOrder ? 'Submitting...' : 'Confirm & Order'}
                variant="primary"
                onPress={handleConfirmOrder}
                loading={submittingOrder}
                style={styles.modalConfirmBtn}
                icon={!submittingOrder ? <Ionicons name="checkmark-circle" size={18} color="#fff" /> : undefined}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    gap: Spacing.xs,
  },
  navButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledNavButton: {
    opacity: 0.4,
  },
  urlBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    overflow: 'hidden',
  },
  urlText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
  detectedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  detectedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  navControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    justifyContent: 'center',
  },
  floatingCtaContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    ...Shadows.lg,
  },
  ctaStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  langIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  langText: {
    fontSize: 11,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    maxHeight: '88%',
    ...Shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  modalTitle: {
    ...TextStyles.h3,
  },
  modalSubtext: {
    ...TextStyles.caption,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  modalScrollContent: {
    paddingBottom: Spacing.md,
  },
  previewCard: {
    height: 180,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.md,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  previewBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...TextStyles.captionMedium,
    marginBottom: Spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    fontFamily: 'font_IRANSans',
    minHeight: 48,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  quantityLabelText: {
    fontSize: 13,
    fontWeight: '500',
  },
  stepperWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityNumberBox: {
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityNumberText: {
    fontSize: 16,
    fontWeight: '700',
  },
  urlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  urlBoxText: {
    fontSize: 12,
    flex: 1,
  },
  modalInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  modalInfoText: {
    ...TextStyles.caption,
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
  },
  modalCancelBtn: {
    flex: 1,
  },
  modalConfirmBtn: {
    flex: 2,
  },
});

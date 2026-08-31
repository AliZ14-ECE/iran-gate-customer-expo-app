/**
 * Iran Gate — Create Order Request Screen
 *
 * Form to submit a new proxy-purchasing request with image uploads.
 */

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { orderService } from "@/services/orderService";
import { BorderRadius, Colors, Spacing, TextStyles, Shadows } from "@/theme";
import { getErrorMessage } from "@/utils/formatters";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function CreateOrderScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const router = useRouter();
  const params = useLocalSearchParams<{
    sourceUrl?: string;
    screenshotUri?: string;
    screenshotUrl?: string;
    title?: string;
  }>();

  const [title, setTitle] = useState(params.title ?? "");
  const [sourceUrl, setSourceUrl] = useState(params.sourceUrl ?? "");
  const [description, setDescription] = useState("");
  const [declaredPrice, setDeclaredPrice] = useState("");
  const [declaredWeight, setDeclaredWeight] = useState("");
  const [declaredVolume, setDeclaredVolume] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const isPreFilledUrl = Boolean(params.sourceUrl);

  const weightVal = parseFloat(declaredWeight);
  const volumeVal = parseFloat(declaredVolume);
  // A simple equation: $10 per kg + $0.05 per cm³ (Modify later)
  const calculatedShippingFee =
    declaredWeight &&
    declaredVolume &&
    (weightVal * 10 + volumeVal * 0.05).toFixed(2);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Handle passed screenshot from params
  useEffect(() => {
    if (params.title && !title) {
      setTitle(params.title);
    }
    if (params.sourceUrl && !sourceUrl) {
      setSourceUrl(params.sourceUrl);
    }
    if (params.screenshotUrl) {
      setImageUrls((prev) => (prev.includes(params.screenshotUrl!) ? prev : [...prev, params.screenshotUrl!]));
    } else if (params.screenshotUri) {
      const uploadLocalScreenshot = async () => {
        try {
          setUploading(true);
          const uploadedUrl = await orderService.uploadImage(params.screenshotUri!);
          setImageUrls((prev) => (prev.includes(uploadedUrl) ? prev : [...prev, uploadedUrl]));
        } catch {
          // If upload fails on mount, user can re-upload or keep local preview
        } finally {
          setUploading(false);
        }
      };
      uploadLocalScreenshot();
    }
  }, [params.sourceUrl, params.screenshotUri, params.screenshotUrl, params.title]);

  const pickAndUploadImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (result.canceled || !result.assets.length) return;

      setUploading(true);
      const uri = result.assets[0].uri;
      const uploadedUrl = await orderService.uploadImage(uri);
      setImageUrls((prev) => [...prev, uploadedUrl]);
    } catch (error) {
      Alert.alert("Upload Failed", getErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Please enter a title for your request.");
      return;
    }
    if (!sourceUrl.trim()) {
      Alert.alert("Validation", "Please enter the source URL.");
      return;
    }
    if (!declaredPrice.trim() || isNaN(Number(declaredPrice))) {
      Alert.alert("Validation", "Please enter a valid declared price.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await orderService.create({
        title: title.trim(),
        source_url: sourceUrl.trim(),
        description: description.trim(),
        declared_price: parseFloat(declaredPrice),
        declared_weight: declaredWeight
          ? parseFloat(declaredWeight)
          : undefined,
        declared_volume: declaredVolume
          ? parseFloat(declaredVolume)
          : undefined,
        declared_shipping_fee: parseFloat(calculatedShippingFee) || undefined,
        image_urls: imageUrls,
      });

      Alert.alert("Success", "Your request has been submitted!", [
        {
          text: "View Order",
          onPress: () => router.replace(`/orders/${response.data.id}`),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Digikala Quick Browser Action Card */}
        <TouchableOpacity
          style={[styles.digikalaBanner, { backgroundColor: '#EF394E' }]}
          onPress={() => router.push('/orders/digikala')}
          activeOpacity={0.85}
        >
          <View style={styles.digikalaBannerLeft}>
            <View style={styles.digikalaIconBadge}>
              <Ionicons name="cart" size={20} color="#EF394E" />
            </View>
            <View style={styles.digikalaBannerTextCol}>
              <Text style={styles.digikalaBannerTitle}>Browse Digikala In-App</Text>
              <Text style={styles.digikalaBannerSubtitle}>
                Auto-translate to Arabic, detect product & pre-fill order
              </Text>
            </View>
          </View>
          <Ionicons name="arrow-forward-circle" size={26} color="#fff" />
        </TouchableOpacity>

        {/* Info Banner */}
        <View
          style={[
            styles.infoBanner,
            { backgroundColor: isPreFilledUrl ? colors.successLight : colors.infoLight, borderColor: isPreFilledUrl ? colors.success : colors.info },
          ]}
        >
          <Ionicons name={isPreFilledUrl ? "checkmark-circle" : "information-circle"} size={20} color={isPreFilledUrl ? colors.success : colors.info} />
          <Text style={[styles.infoText, { color: isPreFilledUrl ? colors.success : colors.info }]}>
            {isPreFilledUrl
              ? "Product information pre-filled from Digikala. Fill any additional details and submit your request."
              : "Provide the product URL and details. Our team will verify the price and send you a quote."}
          </Text>
        </View>

        {/* Form */}
        <Input
          label="Product Title"
          placeholder="e.g., Nike Air Max 90"
          value={title}
          onChangeText={setTitle}
          icon={
            <Ionicons name="pricetag-outline" size={18} color={colors.icon} />
          }
        />

        <Input
          label={isPreFilledUrl ? "Source URL (Pre-filled from Digikala)" : "Source URL"}
          placeholder="https://www.example.com/product"
          value={sourceUrl}
          onChangeText={setSourceUrl}
          editable={!isPreFilledUrl}
          keyboardType="url"
          autoCapitalize="none"
          icon={<Ionicons name={isPreFilledUrl ? "lock-closed-outline" : "link-outline"} size={18} color={isPreFilledUrl ? colors.success : colors.icon} />}
        />

        <Input
          label="Description"
          placeholder="Size, color, quantity, or any special notes..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={styles.textArea}
          icon={
            <Ionicons
              name="document-text-outline"
              size={18}
              color={colors.icon}
            />
          }
        />

        <Input
          label="Price (USD)"
          placeholder="0.00"
          value={declaredPrice}
          onChangeText={setDeclaredPrice}
          keyboardType="decimal-pad"
          icon={<Ionicons name="cash-outline" size={18} color={colors.icon} />}
        />

        {/* Shipping Fee */}
        <Text
          style={{
            fontFamily: "font_IRANSansBold",
            fontSize: 14,
            color: colors.primary,
            marginBottom: 8,
            marginTop: 8,
          }}
        >
          Enter the weight and Volume to approximately calculate Shipping Fee
        </Text>

        <Input
          label="Weight (kg)"
          placeholder="0.5"
          value={declaredWeight}
          onChangeText={setDeclaredWeight}
          keyboardType="decimal-pad"
          icon={
            <Ionicons name="barbell-outline" size={18} color={colors.icon} />
          }
        />

        <Input
          label="Volume (cm³)"
          placeholder="1200"
          value={declaredVolume}
          onChangeText={setDeclaredVolume}
          keyboardType="decimal-pad"
          icon={<Ionicons name="cube-outline" size={18} color={colors.icon} />}
        />

        <Input
          label="Shipping Fee (USD) approximately calculated"
          placeholder="--"
          value={calculatedShippingFee}
          editable={false}
          icon={
            <MaterialCommunityIcons
              name="truck-outline"
              size={18}
              color={colors.icon}
            />
          }
        />

        {/* Image Upload Section */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          Photos (optional)
        </Text>
        <View style={styles.imageGrid}>
          {imageUrls.map((url, index) => (
            <View key={`img-${index}`} style={styles.imageThumb}>
              <Image
                source={{ uri: url }}
                style={styles.thumbImage}
                contentFit="cover"
                transition={150}
              />
              <TouchableOpacity
                style={[styles.removeBtn, { backgroundColor: colors.error }]}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Image Button */}
          <TouchableOpacity
            style={[
              styles.addImageBtn,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
              },
            ]}
            onPress={pickAndUploadImage}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Ionicons name="camera-outline" size={24} color={colors.icon} />
                <Text
                  style={[styles.addImageText, { color: colors.textSecondary }]}
                >
                  Add Photo
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <Button
          title="Submit Request"
          onPress={handleSubmit}
          loading={submitting}
          fullWidth
          size="lg"
          style={styles.submitBtn}
          icon={
            !submitting ? (
              <Ionicons name="paper-plane" size={18} color="#fff" />
            ) : undefined
          }
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const THUMB_SIZE = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing["4xl"],
  },
  digikalaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  digikalaBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
    paddingRight: Spacing.sm,
  },
  digikalaIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digikalaBannerTextCol: {
    flex: 1,
  },
  digikalaBannerTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  digikalaBannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    marginTop: 2,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  infoText: {
    ...TextStyles.caption,
    flex: 1,
    lineHeight: 18,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  sectionLabel: {
    ...TextStyles.captionMedium,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xxs,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing["2xl"],
  },
  imageThumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  addImageBtn: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  addImageText: {
    fontSize: 10,
    fontWeight: "500",
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
});

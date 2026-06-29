/**
 * Iran Gate — Create Order Request Screen
 *
 * Form to submit a new proxy-purchasing request with image uploads.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '@/services/orderService';
import { getErrorMessage } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Spacing, TextStyles, BorderRadius, Shadows } from '@/theme';

export default function CreateOrderScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [description, setDescription] = useState('');
  const [declaredPrice, setDeclaredPrice] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const pickAndUploadImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (result.canceled || !result.assets.length) return;

      setUploading(true);
      const uri = result.assets[0].uri;
      const uploadedUrl = await orderService.uploadImage(uri);
      setImageUrls((prev) => [...prev, uploadedUrl]);
    } catch (error) {
      Alert.alert('Upload Failed', getErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Please enter a title for your request.');
      return;
    }
    if (!sourceUrl.trim()) {
      Alert.alert('Validation', 'Please enter the source URL.');
      return;
    }
    if (!declaredPrice.trim() || isNaN(Number(declaredPrice))) {
      Alert.alert('Validation', 'Please enter a valid declared price.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await orderService.create({
        title: title.trim(),
        source_url: sourceUrl.trim(),
        description: description.trim(),
        declared_price: parseFloat(declaredPrice),
        image_urls: imageUrls,
      });

      Alert.alert('Success', 'Your request has been submitted!', [
        {
          text: 'View Order',
          onPress: () => router.replace(`/orders/${response.data.id}`),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View
          style={[
            styles.infoBanner,
            { backgroundColor: colors.infoLight, borderColor: colors.info },
          ]}
        >
          <Ionicons name="information-circle" size={20} color={colors.info} />
          <Text style={[styles.infoText, { color: colors.info }]}>
            Provide the product URL and details. Our team will verify the price
            and send you a quote.
          </Text>
        </View>

        {/* Form */}
        <Input
          label="Product Title"
          placeholder="e.g., Nike Air Max 90"
          value={title}
          onChangeText={setTitle}
          icon={<Ionicons name="pricetag-outline" size={18} color={colors.icon} />}
        />

        <Input
          label="Source URL"
          placeholder="https://www.example.com/product"
          value={sourceUrl}
          onChangeText={setSourceUrl}
          keyboardType="url"
          autoCapitalize="none"
          icon={<Ionicons name="link-outline" size={18} color={colors.icon} />}
        />

        <Input
          label="Description"
          placeholder="Size, color, quantity, or any special notes..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={styles.textArea}
          icon={<Ionicons name="document-text-outline" size={18} color={colors.icon} />}
        />

        <Input
          label="Declared Price (USD)"
          placeholder="0.00"
          value={declaredPrice}
          onChangeText={setDeclaredPrice}
          keyboardType="decimal-pad"
          icon={<Ionicons name="cash-outline" size={18} color={colors.icon} />}
        />

        {/* Image Upload Section */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          Screenshots (optional)
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
                <Text style={[styles.addImageText, { color: colors.textSecondary }]}>
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
    paddingBottom: Spacing['4xl'],
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    textAlignVertical: 'top',
  },
  sectionLabel: {
    ...TextStyles.captionMedium,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xxs,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing['2xl'],
  },
  imageThumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageBtn: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  addImageText: {
    fontSize: 10,
    fontWeight: '500',
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
});

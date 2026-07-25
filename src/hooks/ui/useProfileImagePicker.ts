import { useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  Asset,
} from 'react-native-image-picker';

export type PickedProfileImage = {
  uri: string;
  type?: string;
  name?: string;
};

const pickFromResponse = (
  response: ImagePickerResponse
): PickedProfileImage | null => {
  if (response.didCancel || response.errorCode) return null;
  const asset: Asset | undefined = response.assets?.[0];
  if (!asset?.uri) return null;
  return {
    uri: asset.uri,
    type: asset.type || 'image/jpeg',
    name: asset.fileName || `avatar-${Date.now()}.jpg`,
  };
};

export const useProfileImagePicker = (
  onPicked: (file: PickedProfileImage) => void
) => {
  const handleGallery = useCallback(async () => {
    const response = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.85,
      selectionLimit: 1,
    });
    const result = pickFromResponse(response);
    if (result) onPicked(result);
  }, [onPicked]);

  const handleCamera = useCallback(async () => {
    const response = await launchCamera({
      mediaType: 'photo',
      quality: 0.85,
      saveToPhotos: false,
      cameraType: 'front',
    });
    const result = pickFromResponse(response);
    if (result) onPicked(result);
  }, [onPicked]);

  const openPicker = useCallback(() => {
    Alert.alert(
      'Profile Photo',
      'Choose a photo source',
      [
        { text: 'Gallery', onPress: () => void handleGallery() },
        ...(Platform.OS !== 'web'
          ? [{ text: 'Camera', onPress: () => void handleCamera() }]
          : []),
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  }, [handleCamera, handleGallery]);

  return { openPicker, handleGallery, handleCamera };
};

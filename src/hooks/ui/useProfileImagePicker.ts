import { useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';

type PickResult = { uri: string } | null;

const pickFromResponse = (response: ImagePickerResponse): PickResult => {
  if (response.didCancel || response.errorCode) return null;
  const uri = response.assets?.[0]?.uri;
  return uri ? { uri } : null;
};

export const useProfileImagePicker = (
  onPicked: (uri: string) => void
) => {
  const handleGallery = useCallback(async () => {
    const response = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.85,
      selectionLimit: 1,
    });
    const result = pickFromResponse(response);
    if (result?.uri) onPicked(result.uri);
  }, [onPicked]);

  const handleCamera = useCallback(async () => {
    const response = await launchCamera({
      mediaType: 'photo',
      quality: 0.85,
      saveToPhotos: false,
      cameraType: 'front',
    });
    const result = pickFromResponse(response);
    if (result?.uri) onPicked(result.uri);
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

import { useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { pick, types } from '@react-native-documents/picker';

export type PickedFile = {
  uri: string;
  name?: string;
  type?: string;
};

const useDocumentUpload = () => {
  const [frontImage, setFrontImage] = useState<PickedFile | null>(null);
  const [backImage, setBackImage] = useState<PickedFile | null>(null);
  const [certificate, setCertificate] = useState<PickedFile | null>(null);

  const pickImage = async (type: 'front' | 'back') => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const file: PickedFile = {
          uri: asset.uri || '',
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `${type}-cnic.jpg`,
        };

        if (type === 'front') setFrontImage(file);
        else setBackImage(file);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const pickDocument = async () => {
    try {
      const [result] = await pick({
        type: [types.pdf, types.images],
        allowMultiSelection: false,
      });

      setCertificate({
        uri: result.uri,
        name: result.name ?? 'degree.pdf',
        type: result.type ?? 'application/pdf',
      });
    } catch (error) {
      console.log(error);
    }
  };

  const isButtonDisabled = !frontImage?.uri || !backImage?.uri || !certificate?.uri;

  return {
    frontImage,
    backImage,
    certificate,
    pickImage,
    pickDocument,
    isButtonDisabled,
  };
};

export default useDocumentUpload;

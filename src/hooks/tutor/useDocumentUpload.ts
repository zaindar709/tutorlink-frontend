import { useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { pick, types } from '@react-native-documents/picker';

const useDocumentUpload = () => {
  const [frontImage, setFrontImage] = useState('');
  const [backImage, setBackImage] = useState('');
  const [certificate, setCertificate] = useState<any>(null);

  const pickImage = async (type: 'front' | 'back') => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri || '';

        if (type === 'front') setFrontImage(uri);
        else setBackImage(uri);
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

      setCertificate(result);
    } catch (error) {
      console.log(error);
    }
  };

  const isButtonDisabled = !frontImage || !backImage || !certificate;

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
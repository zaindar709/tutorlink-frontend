import { Platform } from 'react-native';

export type UploadFilePayload = {
  uri: string;
  name: string;
  type: string;
};

export const normalizeUploadUri = (uri: string): string => {
  if (!uri) {
    return uri;
  }

  if (Platform.OS === 'android') {
    if (uri.startsWith('content://') || uri.startsWith('file://')) {
      return uri;
    }
    return `file://${uri}`;
  }

  return uri;
};

export const buildUploadFile = (
  uri: string,
  name: string,
  type: string
): UploadFilePayload => {
  if (!uri || typeof uri !== 'string') {
    throw new Error('Invalid file URI. Please re-select the document and try again.');
  }

  return {
    uri: normalizeUploadUri(uri),
    name,
    type: type || 'application/octet-stream',
  };
};

export const guessMimeType = (
  uri: string,
  fallback = 'image/jpeg'
): string => {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  return fallback;
};

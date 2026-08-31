import { Platform } from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  check,
  request,
  openSettings,
  type Permission,
} from 'react-native-permissions';

export type MediaPermissionResult = {
  camera: boolean;
  microphone: boolean;
  deniedForever: boolean;
  message?: string;
};

const cameraPermission = (): Permission | null => {
  if (Platform.OS === 'android') return PERMISSIONS.ANDROID.CAMERA;
  if (Platform.OS === 'ios') return PERMISSIONS.IOS.CAMERA;
  return null;
};

const micPermission = (): Permission | null => {
  if (Platform.OS === 'android') return PERMISSIONS.ANDROID.RECORD_AUDIO;
  if (Platform.OS === 'ios') return PERMISSIONS.IOS.MICROPHONE;
  return null;
};

const isGranted = (status: string) =>
  status === RESULTS.GRANTED || status === RESULTS.LIMITED;

const isBlocked = (status: string) =>
  status === RESULTS.BLOCKED || status === RESULTS.UNAVAILABLE;

/**
 * Request camera + microphone before joining a TutorLink classroom.
 */
export const requestClassroomPermissions =
  async (): Promise<MediaPermissionResult> => {
    const cam = cameraPermission();
    const mic = micPermission();

    if (!cam || !mic) {
      return {
        camera: true,
        microphone: true,
        deniedForever: false,
      };
    }

    let camStatus = await check(cam);
    let micStatus = await check(mic);

    if (!isGranted(camStatus)) {
      camStatus = await request(cam);
    }
    if (!isGranted(micStatus)) {
      micStatus = await request(mic);
    }

    const camera = isGranted(camStatus);
    const microphone = isGranted(micStatus);
    const deniedForever = isBlocked(camStatus) || isBlocked(micStatus);

    let message: string | undefined;
    if (!camera && !microphone) {
      message =
        'Camera and microphone access are required for live classes. Enable them in Settings.';
    } else if (!camera) {
      message =
        'Camera access was denied. Enable camera permission in Settings to join with video.';
    } else if (!microphone) {
      message =
        'Microphone access was denied. Enable microphone permission in Settings to speak in class.';
    }

    return { camera, microphone, deniedForever, message };
  };

export const openAppPermissionSettings = () => openSettings().catch(() => undefined);

export const formatSessionTimer = (totalSeconds: number): string => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

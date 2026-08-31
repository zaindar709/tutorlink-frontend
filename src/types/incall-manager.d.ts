declare module 'react-native-incall-manager' {
  const InCallManager: {
    start: (options?: { media?: 'audio' | 'video'; auto?: boolean }) => void;
    stop: (options?: { busytone?: string }) => void;
    setForceSpeakerphoneOn: (flag: boolean | null) => void;
    setSpeakerphoneOn: (enable: boolean) => void;
    setMicrophoneMute: (mute: boolean) => void;
  };
  export default InCallManager;
}

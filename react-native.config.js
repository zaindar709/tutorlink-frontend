module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: [
    './node_modules/@react-native-vector-icons/*/fonts/',
  ],
  dependencies: {
    // Not used in JS — exclude native code from Release APK to cut size.
    'react-native-maps': {
      platforms: { android: null, ios: null },
    },
    'react-native-webrtc': {
      platforms: { android: null, ios: null },
    },
    'react-native-incall-manager': {
      platforms: { android: null, ios: null },
    },
  },
};

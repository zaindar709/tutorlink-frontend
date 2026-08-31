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
    // react-native-webrtc + react-native-incall-manager MUST stay autolinked
    // for the classroom. Do not set platforms to null here.
  },
};

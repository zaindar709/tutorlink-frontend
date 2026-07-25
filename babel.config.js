module.exports = api => {
  const plugins = [];

  // Release-only: strip console.* from the JS bundle (keep console.error).
  if (api.env('production')) {
    plugins.push(['transform-remove-console', { exclude: ['error'] }]);
  }

  // Reanimated must be listed last.
  plugins.push('react-native-reanimated/plugin');

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins,
  };
};

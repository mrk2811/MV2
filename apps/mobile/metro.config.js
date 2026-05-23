const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude test directories from the Metro bundler so test deps
// never interfere with the Expo runtime bundle.
config.resolver.blockList = [
  /.*\/__tests__\/.*/,
  /.*\/__mocks__\/.*/,
];

module.exports = config;

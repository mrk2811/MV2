const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude test directories from the Metro bundler so test deps
// never interfere with the Expo runtime bundle.
config.resolver.blockList = [
  /.*\/__tests__\/.*/,
  /.*\/__mocks__\/.*/,
];

// Shim promise/setimmediate/* for @sentry/react-native (removed in RN 0.81)
const SHIMS = {
  'promise/setimmediate/done': path.resolve(__dirname, 'shims/promise/setimmediate/done.js'),
  'promise/setimmediate/finally': path.resolve(__dirname, 'shims/promise/setimmediate/finally.js'),
  'promise/setimmediate/es6-extensions': path.resolve(__dirname, 'shims/promise/setimmediate/es6-extensions.js'),
  'promise/setimmediate/rejection-tracking': path.resolve(__dirname, 'shims/promise/setimmediate/rejection-tracking.js'),
};
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (SHIMS[moduleName]) {
    return { type: 'sourceFile', filePath: SHIMS[moduleName] };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

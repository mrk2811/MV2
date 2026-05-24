// Shim: promise/setimmediate/es6-extensions (removed in RN 0.81)
// Sentry uses this as the Promise constructor reference.
// In RN 0.81+ the global Promise is already the correct implementation.
module.exports = Promise;

// Shim: promise/setimmediate/rejection-tracking (removed in RN 0.81)
// Sentry uses this for unhandled rejection tracking.
module.exports = {
  disable: function() {},
  enable: function() {},
};

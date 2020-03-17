module.exports = class InstantPromiseQueue {
  static schedule(promise) {
    return promise();
  }

  schedule(promise) {
    return promise();
  }
};

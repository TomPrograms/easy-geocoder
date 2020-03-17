const LRUCache = require("lru-cache");
const Bottleneck = require("bottleneck");
const axios = require("axios");
const crypto = require("crypto");

const globalCache = new LRUCache({
  max: 10000, // 10,000 entries limit
  maxAge: 1000 * 60 * 60 * 24 // one day max age
});
const globalPromiseQueue = new Bottleneck({
  maxConcurrent: 1,
  minTime: 1000 // only one promise per second
});

class Request {
  constructor(requestData) {
    this.requestData = requestData;

    this.createHash();
  }

  createHash() {
    this.hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(this.requestData))
      .digest("hex");
  }
}

class EasyGeocoder {
  constructor(options = {}) {
    this.https = options.https || true;
    this.host = options.host || "nominatim.openstreetmap.org";
    this.cacheInstance = options.cacheInstance;
    this.promiseQueue = options.promiseQueue;
    this.cache = options.cache || true;
    this.useragent = options.useragent
      ? `${options.useragent} powered by Easy-Geocoder NPM Library.`
      : "Application powered by Easy-Geocoder NPM Library.";

    this.requestDefaults = {
      format: options.format ? options.format.toLowerCase() : "json",
      limit: options.limit || 3
    };
  }

  setCache(key, data) {
    (this.cacheInstance || globalCache).set(key, data);
  }

  getCache(key) {
    return (this.cacheInstance || globalCache).get(key);
  }

  getURL(path) {
    let constructed = this.host + path;

    // if no protocol, append appropriate protocol
    let noProtocol =
      !constructed.startsWith("https://") && !constructed.startsWith("http://");
    if (noProtocol) {
      constructed = (this.https ? "https://" : "http://") + constructed;
    }

    // remove any duplicate slashes
    return constructed.replace(/([^:]\/)\/+/g, "$1");
  }

  addPromiseToQueue(promise) {
    return (this.promiseQueue || globalPromiseQueue).schedule(() => promise);
  }

  request(url, request) {
    // check if data is cached
    if (this.cache === true) {
      let cachedData = this.getCache(request.hash);
      if (cachedData) return Promise.resolve(cachedData);
    }

    return this.addPromiseToQueue(
      new Promise((resolve, reject) => {
        axios
          .get(url, {
            headers: {
              "User-Agent": this.useragent
            },
            // convert object to plain JSON object
            params: JSON.parse(JSON.stringify(request.requestData))
          })
          .then(response => {
            if (this.cache === true) {
              this.setCache(request.hash, response.data);
            }

            resolve(response.data);
          })
          .catch(error => {
            reject(error);
          });
      })
    );
  }

  createRequest(url, requestData, specificOptions) {
    requestData = {
      ...requestData,
      ...this.requestDefaults,
      ...specificOptions
    };
    const requestObj = new Request(requestData);

    return this.request(url, requestObj);
  }

  lookup(requestData, specificOptions) {
    const url = this.getURL("/lookup");
    return this.createRequest(url, requestData, specificOptions);
  }

  search(requestData, specificOptions) {
    const url = this.getURL("/search");
    return this.createRequest(url, requestData, specificOptions);
  }

  reverse(requestData, specificOptions) {
    const url = this.getURL("/reverse");
    return this.createRequest(url, requestData, specificOptions);
  }
}

class EasyGeocoderCallbackWrapper extends EasyGeocoder {
  search(query, options, callback) {
    const returnedPromise = super.search(query, options);

    // allow callback to be second option
    if (callback === undefined && typeof options === "function") {
      callback = options;
    }

    return this.convertToCallback(returnedPromise, callback);
  }

  reverse(query, options, callback) {
    const returnedPromise = super.reverse(query, options);

    // allow callback to be second option
    if (callback === undefined && typeof options === "function") {
      callback = options;
    }

    return this.convertToCallback(returnedPromise, callback);
  }

  lookup(query, options, callback) {
    const returnedPromise = super.lookup(query, options);

    // allow callback to be second option
    if (callback === undefined && typeof options === "function") {
      callback = options;
    }

    return this.convertToCallback(returnedPromise, callback);
  }

  convertToCallback(promise, callback) {
    if (typeof callback !== "function") return promise;

    return promise
      .then(result => callback(null, result))
      .catch(error => callback(error, null));
  }
}

module.exports = EasyGeocoder;
module.exports.EasyGeocoderCallbackWrapper = EasyGeocoderCallbackWrapper;

<div align="center">
  <img src="./docs/assets/logo.png" alt="Easy Geocoder logo">

  <p>Easy Geocoder is the easiest, up-to-date way to Geocode in Javascript. Coming out-of-the-box with a wrapper for geocoding and reverse-geocoding for free with no API key required, and featuring caching, API-compliant design and support for custom endpoints.</p>

  <a href="https://npmjs.com/package/easy-geocoder">
    <img src="https://img.shields.io/npm/v/easy-geocoder">
  </a>

  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue">
  </a>
</div>

<br>

> Example: Geocode "Buckingham Palace, England" and console.log latitude and longitude of most relevant result.

```js
Geocoder.search({ q: "Buckingham Palace, England" }).then(result => {
  console.log(result[0].lat, result[0].lon);
});
```

## Design

By default, Easy Geocoder uses the Nominatim API public instance. Therefore, when using default settings, Easy Geocoder must comply with the [Nominatim public usage policy](https://operations.osmfoundation.org/policies/nominatim/). In order to comply with the Nominatim public usage policy, Easy Geocoder by default uses a 1-per-second-max promise queue shared between all instances of Easy Geocoder. Easy Geocoder, by default, also shares one cache store betwen instances so as few requests as possible are required. If you host your own version of Nominatim (which is free to do) you can provide Easy Geocoder with instant-execution promise queues to get uncapped performance. Also, in order to comply with Nominatim public API usage policy you should provide a useragent identifying your application.

## Basic Usage

You can install Easy Geocoder through NPM:

```
$ npm i geocoder
```

You can then initialize an Easy Geocoder instance. You should provide a useragent if you are not hosting your own Nominatim API, in order to comply with their usage policy.

```js
const EasyGeocoder = require("easy-geocoder");
const Geocoder = new EasyGeocoder({
  useragent: "My Application Name"
});
```

You can then geocode (gather information about an address) like so:

```js
Geocoder.search({ q: "Buckingham Place, London" }).then(result => {
  // outputs "51.4990929 -0.1401781"
  console.log(result[0].lat, result[0].lon);
});
```

## Examples

Geocode location:

```js
Geocoder.search({ q: "Buckingham Place, London" }).then(result => {
  // outputs "51.4990929 -0.1401781"
  console.log(result[0].lat, result[0].lon);
});
```

If you know specific components of the address (e.g. the country, county, street), it is recommended you stucture the address into those components for the API call as it will be faster. You don't have to use all the specific parameters and you should not combine this with the general purpose `q` parameter. The specific components available are `country`, `state`, `county`, `city`, `postalcode`, `street`. For example:

```js
Geocoder.search({
  country: "United Kingdom",
  city: "London",
  postalcode: "SW1A 1AA",
  street: "Buckingham Palace Road"
}).then(result => {
  // outputs "51.501128 -0.1404654"
  console.log(result[0].lat, result[0].lon);
});
```

Reverse geocode co-ordinates:

```js
Geocoder.reverse({ lat: "51.501210", lon: "-0.142126" }).then(result => {
  // outputs "Buckingham Palace"
  console.log(result.address.attraction);
});
```

Geocode OSM object:

```js
Geocoder.lookup({
  osm_ids: "R146656"
}).then(result => {
  // outputs "Manchester"
  console.log(result[0].address.city);
});
```

Geocode multiple OSM objects:

```js
Geocoder.lookup({
  osm_ids: "R146656,N240109189"
}).then(result => {
  // outputs "Manchester Berlin"
  console.log(result[0].address.city, result[1].address.city);
});
```

Using callbacks instead of Promises:

```js
const EasyGeocoder = require("easy-geocoder").Callbacks;
const Geocoder = new EasyGeocoder({
  useragent: "My Application Name"
});

Geocoder.search({ q: "Buckingham Place, London" }, function(error, result) {
  // outputs "51.4990929 -0.1401781"
  console.log(result[0].lat, result[0].lon);
});
```

Changing default request parameters:

```js
const Geocoder = new EasyGeocoder({
  format: "xml", // response format, json by default
  limit: 3 // max number of responses, 3 by default
});
```

Changing request parameters per request with promises:

```js
Geocoder.search({ q: "Buckingham Place, London" }, { limit: 1 }).then(
  result => {
    // outputs list with one result
    console.log(result);
  }
);
```

Changing request parameters per request with callbacks:

```js
const query = { q: "Buckingham Place, London" };
Geocoder.search(query, { limit: 1 }, function(error, result) {
  // outputs list with one result
  console.log(result);
});
```

Using HTTP (unsecure) connection instead of HTTPS (secure) default connection:

```js
const Geocoder = new EasyGeocoder({
  https: false
});
```

Use other instance of Nominatim API:

```js
const Geocoder = new EasyGeocoder({
  host: "nominatim.example.com"
});
```

Uncapping performance by allowing unlimited parallel API requests with no delay. This should only be done on API instances that allow for unlimited requests-per-second such as custom instances. This should be not used with the default Nominatim API instance.

```js
const Geocoder = new EasyGeocoder({
  promiseQueue: new EasyGeocoder.InstantPromiseQueue()
});
```

Provide a custom cache. You may want to do this if the default settings of the default cache don't meet your needs (one day max age and 10,000 max items) or you don't want one cache for all Easy Geocoder instances.

```js
const LRUCache = require("lru-cache");
const Geocoder = new EasyGeocoder({
  cacheInstance: new LRUCache({
    max: 100000, // 100,000 entries
    maxAge: 1000 * 60 * 60 * 24 * 10 // ten days max age
  })
});
```

Disable Caching:

```js
const Geocoder = new EasyGeocoder({
  cache: false
});
```

## Credit

Author: [Tom](https://github.com/TomPrograms)

## License

[MIT](./LICENSE)

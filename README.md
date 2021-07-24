# lcdb-server
Server api for lcdb.
```javascript
require("lcdb-server")({
  cacheTimeout = 15000,
  auth: "secret",
  wsOptions: {},
  port: 8080
});
```
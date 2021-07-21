const lcdb = require("lcdb"),
  express = require("express"),
  app = express(),
  dbs = {},
  times = new Map();

module.exports = ({
  cacheTimeout = 15000,
  auth,
  port
}) => {
  setInterval(() => times.forEach((value, key) => {
    if (Date.now() - value >= cacheTimeout) {
      times.delete(key);
      
      delete dbs[key];
    }
  }), cacheTimeout);
  
  app.get("/", (req, res) => res.send("ok"));
  
  app.post("/", (req, res) => {
    if (req.headers.authorization !== auth) return res.end();
    
    var body = "";
    
    req.on("data", data => {
      body += data;
    }).on("end", () => {
      const {
        db, options, method, ref, value
      } = JSON.parse(body);
      
      if (!dbs[db]) dbs[db] = lcdb(db, options);
      
      res.json({
        data: dbs[db][method] ? dbs[db][method](ref, value) : null
      });
    });
  });
  
  app.listen(port);
};
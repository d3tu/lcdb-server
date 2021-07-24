const lcdb = require("lcdb"),
  { Server } = require("ws"),
  dbs = {},
  times = new Map();

module.exports = ({
  cacheTimeout = 15000,
  auth,
  wsOptions,
  port
} = {}) => {
  const server = new Server(wsOptions);
  
  setInterval(() => times.forEach((value, key) => {
    if (Date.now() - value >= cacheTimeout) {
      times.delete(key);
      
      delete dbs[key];
    }
  }), cacheTimeout);
  
  server.on("connection", client => {
    client.on("message", message => {
      const {
        id, db, options, method, ref, value, op, auth: pass
      } = JSON.parse(body);
      
      if (op === "login") {
        if (pass === auth) return client.send("CONNECTED");
        else return client.close();
      }
      
      if (!dbs[db]) dbs[db] = lcdb(db, options);
      
      client.send(JSON.stringify({
        id,
        data: dbs[db][method] ? dbs[db][method](ref, value) : null
      }));
    });
  });
  
  server.listen(port);
};
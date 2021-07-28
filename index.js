const lcdb = require('lcdb'),
	{ Server } = require('ws'),
	times = new Map(),
	dbs = {};
module.exports = ({ cacheTimeout = 15000, auth, wsOptions } = {}) => {
	const server = new Server(wsOptions);
	setInterval(
		() =>
			times.forEach((value, key) => {
				if (Date.now() - value >= cacheTimeout) {
					times.delete(key);
					delete dbs[key];
				}
			}),
		cacheTimeout
	);
	server.on('connection', client => {
		let connected;
		client.on('message', message => {
			var req = {};
			try {
				req = JSON.parse(message);
			} catch (err) {}
			if (req.op === 'login') {
				if (auth === req.auth) {
					connected = true;
					req.requests &&
						req.requests.forEach(request => {
							try {
								request = JSON.parse(request);
								typeof request === 'object' && run(request);
							} catch (err) {}
						});
					return client.send('CONNECTED');
				} else return client.close();
			}
			if (!connected) return client.close();
			run(req);
			function run({ id, db, options, method, ref, value } = {}) {
				times.set(db, Date.now());
				if (!dbs[db]) dbs[db] = lcdb(db, options);
				let res;
				try {
					if (method === 'get') res = dbs[db][method](ref);
					else {
						dbs[db][method](ref, value);
						res = true;
					}
				} catch (err) {}
				return client.send(JSON.stringify({ id, data: res }));
			}
		});
	});
	return { server, times, dbs };
};

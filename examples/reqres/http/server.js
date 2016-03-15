/*
 * A simple talk req/res test server with http
 */
var talk = require('../../../');
var server = talk.reqrep.serve({ port: 11177, protocol: 'http' });

server.on('foo', function(payload, meta) {
    console.log('Got request:', payload);
    return Promise.resolve({ok: true});
});

server.start()
    .then(function() {
        console.log('Server started with http as the protocol');
    });


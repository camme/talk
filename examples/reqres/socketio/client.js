/*
 * A simple talk req/res test client with http
 */
var talk = require('../../../');
var client = talk.reqrep.client({ protocol: 'socketio' });

client.send('localhost:11177', 'foo', {foo: 'bar'})
    .then(function(res, meta) {
        console.log('Got response: ', res);        
    });



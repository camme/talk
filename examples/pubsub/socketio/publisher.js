/*
 * Simple publisher example
 *
 * This example requires a redis server at 127.0.0.1
 */

var talk = require('../../../');

var pubsub = talk.pubsub({
    host: '127.0.0.1',
    port: 6379
});

pubsub.emit('hej', {foo: 'bar'});
console.log('Emitted an event');


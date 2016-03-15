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

pubsub.on('hej', function(event) {
    console.log('Got an event:', event);
});

console.log('Started subscribing');

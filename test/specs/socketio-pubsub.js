var talk = require('../../');
var should = require('should');

describe('The socketio pubsub', function() {

    var pubsub;
    beforeEach(function(done) {

        pubsub = talk.pubsub({
            host: '127.0.0.1',
            port: 6379
        });

        done();

    });

    afterEach(function(done) {
        pubsub.close().then(function() { done() });
    });

    it('should be able emit an event and listen to it', function(done) {

        pubsub.on('hej', function(payload, meta) {
            payload.should.have.property('foo', 'bar');
            done();
        });

        pubsub.emit('hej', {foo: 'bar'});

    });

});

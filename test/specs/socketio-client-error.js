var talk = require('../../');
var should = require('should');

describe('The socketio client errors', function() {

    var server = talk.reqrep.serve({ port: 11177, protocol: 'socketio' });
    var client = talk.reqrep.client({ protocol: 'socketio' });

    beforeEach(function(done) {
        server.start()
            .then(function() {
                done();
            });
    });

    afterEach(function(done) {
        server.clear()
            .then(function() { return server.stop(); })
            .then(function() { done() });
    });

    it('should be able to propagate errors', function(done) {

        server.on('hej', function(payload, meta) {
            return Promise.resolve()
                .then(() => {
                    throw new Error('foo');
                });
        });

        client.send('localhost:11177', 'hej', {foo: 'bar'})
            .then(() => {
                done('No error recieved');
            })
            .catch(err => {
                err.message.should.be.equal('foo');
                err.stack.should.match(/socketio-client-error\.js:27:27/);
                done();
            });

    });


});

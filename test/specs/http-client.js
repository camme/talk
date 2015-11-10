var talk = require('../../');
var should = require('should');

describe('The http client', function() {

    var server = talk.reqrep.serve({ port: 11177 });
    var client = talk.reqrep.client({ protocol: 'http' });

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

    it('should be able to send content to a server', function(done) {

        server.on('hej', function(payload, meta) {
            payload.should.have.property('foo', 'bar');
            done();
            return Promise.resolve({ok: true});
        });

        client.send('localhost:11177', 'hej', {foo: 'bar'});

    });

    it('should be able to send a request to a server without a payload', function(done) {

        server.on('hej', function(payload, meta) {
            done();
            return Promise.resolve({ok: true});
        });

        client.send('localhost:11177', 'hej');

    });



});

var talk = require('../../');
var should = require('should');

describe('The socketio client with gzip', function() {

    var server = talk.reqrep.serve({port: 11177, protocol: 'socketio', gzip: true});

    var client = talk.reqrep.client({
        protocol: 'socketio',
        gzip: true
    });

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

    it('should be able to send gziped content to a server', function(done) {

        server.on('hej', function(payload, meta) {
            payload.should.have.property('foo', 'bar');
            meta.should.have.property('gzip', true);
            done();
            return Promise.resolve({ok: true});
        });

        client.send('localhost:11177', 'hej', {foo: 'bar'});

    });

    it('should be able to send gziped content to a server without a payload', function(done) {

        server.on('hej', function(payload, meta) {
            should.not.exist(payload);

            // An empty payload will not be zipped
            meta.should.have.property('gzip', false);
            done();
            return Promise.resolve({ok: true});
        });

        client.send('localhost:11177', 'hej');

    });



});

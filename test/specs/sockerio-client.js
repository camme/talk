var talk = require('../../');
var should = require('should');

describe('The socketio client', function() {

    var server = talk.reqrep.serve({port: 11177, protocol: 'socketio'});

    var client = talk.reqrep.client({
        pick: function (name) { return Promise.resolve({ host: 'localhost', port: 11177 }); }
    }, {
        protocol: 'socketio',
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

    it('should be able to send un-gziped content to a server', function(done) {

        server.on('hej', function(payload, meta) {
            payload.should.have.property('foo', 'bar');
            meta.should.have.property('gzip', false);
            done();
            return Promise.resolve({ok: true});
        });

        client.send('foo', 'hej', {foo: 'bar'});

    });

    it('should be able to send un-gziped content to a server without a payload', function(done) {

        server.on('hej', function(payload, meta) {
            should.not.exist(payload);
            meta.should.have.property('gzip', false);
            done();
            return Promise.resolve({ok: true});
        });

        client.send('foo', 'hej');

    });



});

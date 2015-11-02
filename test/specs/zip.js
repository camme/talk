var talk = require('../../');
var should = require('should');



describe('Zip', function() {

    var server = talk.reqrep.serve({port: 11177, protocol: 'socketio', gzip: true});

    var clientZip = talk.reqrep.client({
        pick: function (name) {
            return Promise.resolve({ host: 'localhost', port: 11177 });
        }
    }, {
        protocol: 'socketio',
        gzip: true
    });

    var client = talk.reqrep.client({
        pick: function (name) {
            return Promise.resolve({ host: 'localhost', port: 11177 });
        }
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

    it('A client should be able to send gzipped content to the server with sockerio', function(done) {

        server.on('hej', function(payload, meta) {
            payload.should.have.property('foo', 'bar');
            meta.should.have.property('gzip', true);
            done();
            return Promise.resolve({ok: true});
        });

        clientZip.send('foo', 'hej', {foo: 'bar'})
            .then(function(result) {
            });

    });

    it('A client should be able to send gzipped content to the server with sockerio', function(done) {

        server.on('hej', function(payload, meta) {
            payload.should.have.property('foo', 'bar');
            meta.should.have.property('gzip', false);
            done();
            return Promise.resolve({ok: true});
        });

        client.send('foo', 'hej', {foo: 'bar'})
            .then(function(result) {
            });

    });

});

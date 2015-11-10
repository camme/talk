var talk = require('../../');
var should = require('should');

describe('The socketio client', function() {

    var server = talk.reqrep.serve({port: 11177, protocol: 'socketio'});

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

    it('should be able to send something with a resolve function', function(done) {

        var client = talk.reqrep.client({
            resolve: function (name) { return Promise.resolve({ host: 'localhost', port: 11177 }); },
            protocol: 'socketio'
        });

        server.on('hej', function(payload, meta) {
            done();
            return Promise.resolve({ok: true});
        });

        client.send('foo', 'hej', {foo: 1});

    });

    it('should be able to send something with a pick function, ie the old style', function(done) {

        var client = talk.reqrep.client({
            pick: function (name) { return Promise.resolve({ host: 'localhost', port: 11177 }); }
        }, {
            protocol: 'socketio'
        });

        server.on('hej', function(payload, meta) {
            done();
            return Promise.resolve({ok: true});
        });

        client.send('foo', 'hej', {foo: 1});

    });




});

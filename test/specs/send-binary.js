var talk = require('../../');
var should = require('should');
var fs = require('fs');
var path = require('path');

describe('The  client with gzip', function() {

    var serverSocketio = talk.reqrep.serve({port: 11177, protocol: 'socketio', gzip: true});
    var serverHttp = talk.reqrep.serve({port: 11178, protocol: 'http', gzip: true});
    var readImagePath = path.join(__dirname, '../data/cat.jpg');

    beforeEach(function(done) {
        serverSocketio.start()
            .then(serverHttp.start)
            .then(function() {
                done();
            });
    });

    afterEach(function(done) {
        serverSocketio.clear()
            .then(serverHttp.clear)
            .then(function() { return serverSocketio.stop(); })
            .then(function() { return serverHttp.stop(); })
            .then(function() { done() });
    });

    it('should be able to send binary content with socketio', function(done) {

        var client = talk.reqrep.client({
            protocol: 'socketio',
            gzip: true
        });

        var buffer = fs.readFileSync(readImagePath);
        var base64Buffer = buffer.toString('base64');

        serverSocketio.on('hej', function(payload, meta) {
            var base64 = payload.toString('base64');
            base64.should.be.equal(base64Buffer);
            done();
            return Promise.resolve({ok: true});
        });

        client.send('localhost:11177', 'hej', buffer, {binary: true});

    });

    it('should be able to send binary content with http', function(done) {

        var client = talk.reqrep.client({
            protocol: 'http',
            gzip: true
        });

        var buffer = fs.readFileSync(readImagePath);
        var base64Buffer = buffer.toString('base64');

        serverHttp.on('hej', function(payload, meta) {
            var base64 = payload.toString('base64');
            base64.should.be.equal(base64Buffer);
            done();
            return Promise.resolve({ok: true});
        });

        client.send('localhost:11178', 'hej', buffer, {binary: true});

    });


});

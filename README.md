# talk

Talk is a node module to help you abtract the way your node applications talk to each. You dont need to decide if you want to use http/REST or sockets or websockets or something else from **day one**.
Often, when creating a complex server/service setup, you might now know exatcly how the end result will be. Optimizing a solution is therefore quite hard. So if you choose the way your services talk to eachother too early, you might need to change quite a lot at the end.

Talk gives you an easy interface to both setup and communicate with your services. It is up to you later so change, add or optimize the protocol it uses. 

### Basics
At its heart, it exposes two communication patterns:

- Request / Response
- Publisher / Subscriber

That means that you can create a server and talk to it and use either protocol without it affecting how you write your application. 

### Simple req/res example:

We create a server:

    var server = talk.reqrep.serve({port: 11177, protocol: 'http'});

    server.on('hej', function(payload, meta) {
        return Promise.resolve({thanks: true});
    });

    server.start()
        .then(function() {
            console.log('The server is listening');
        });

And a client:

    var client = talk.reqrep.client({ protocol: 'http' });

    client.send('localhost:11177', 'hej', {foo: 'bar'})
        .then(function(result) {
            console.log('Got this from the server: ', result);
        });

#### ... and the same with socketio

We create a server (the only difference being that we change it to socketio):

    var server = talk.reqrep.serve({port: 11177, protocol: 'socketio'});

    server.on('hej', function(payload, meta) {
        return Promise.resolve({thanks: true});
    });

    server.start()
        .then(function() {
            console.log('The server is listening');
        });

And a client:

    var client = talk.reqrep.client({ protocol: 'socketio' });

    client.send('localhost:11177', 'hej', {foo: 'bar'})
        .then(function(result) {
            console.log('Got this from the server: ', result);
        });

#### Gzipping your data (currently only works with socketio)

Server:

    // just add the gzip flag and all content sent back to the client will be gzipped
    var server = talk.reqrep.serve({port: 11177, protocol: 'socketio', gzip: true});

    server.on('hej', function(payload, meta) {
        return Promise.resolve({thanks: true});
    });

    server.start()
        .then(function() {
            console.log('The server is listening');
        });

And a client:

    // Add the gzip flag and all content sent to the server will be gzipped
    var client = talk.reqrep.client({ protocol: 'socketio', gzip: true });

    client.send('localhost:11177', 'hej', {foo: 'bar'})
        .then(function(result) {
            console.log('Got this from the server: ', result);
        });

    client.send('localhost:11177', 'hej', {foo: 'bar'})
        .then(function(result) {
            console.log('Got this from the server: ', result);
        });

#### Sending binary data

    var buffer = .... // your cool buffer
    client.send('localhost:11177', 'hej', buffer, { binary: true })
        .then(function(result) {
            console.log('Got this from the server: ', result);
        });


### Simple pub/sub (with socketio and redis)

The pubsub uses socketio through a redis adapter so your events are mited to all your subscribing clients.

The subscriber:

    var pubsub = talk.pubsub({ host: '127.0.0.1', port: 6379 });

    pubsub.on('hej', function(payload) {
        console.log(payload);
    });

The publisher:

    var pubsub = talk.pubsub({ host: '127.0.0.1', port: 6379 });
    pubsub.emit('hej', {foo: 'bar'});

### Next steps

- ~~Add pub/sub (yeah I know, it should be there)~~ *Done!*
- Add signing of payload (jwt)
- Add methods to add balancing functions from outside the module
- Add methods to add protocols from outside the module
- Make it more pluggable so its easier to add more protocols


### Contributions

The idea to do this came from when [Camilo Tapia](https://github.com/camme) and [Chris Hedgate](https://github.com/chrishedgate) discussed how to create an application for a client.

# talk

Talk is a node module to help you abtract the way your node applications talk to each. You dont need to decide if you want to use http/REST or sockets or websockets or something else from **day one**.
Often, when creating a complex server/service setup, you might now know exatcly how the end result will be. Optimizing a solution is therefore quite hard. So if you choose the way your services talk to eachother too early, you might need to change quite a lot at the end.

Talk gives you an easy interface to both setup and communicate with your services. It is up to you later so change, add or optimize the protocol it uses. 

### Basics
At its heart, it exposes two communication patterns:

- Request / Response
- Publisher / Subscriber

And the current version supports both HTTP and websockets (socketio).

That means that you can create a server and talk to it and use either protocol without it affecting how you write your application. 

### Simple example:

We create a server:

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

### Current state
Although its in use already, its still considered under development, which means that things might change a lot. If you want to use it anyway, just remember that future releases might contain breaking changes.

### Next steps

- Add pub/sub (yeah I know, it should be there)
- Add signing of payload (jwt)
- Add methods to add balancing functions from outside the module
- Add methods to add protocols from outside the module


### Contributions

The idea to do this came from when [Camilo Tapia](https://github.com/camme) and [Chris Hedgate](https://github.com/chrishedgate) discussed how to create an application for a client.

var Promise = require('es6-promise').Promise;

var protocols = {
    http: require('./protocol-http'),
    socketio: require('./protocol-socketio')
};

// Sends a command to the chosen service
exports.client = function(discoverer, options) {

    // To make sure it back compatible
    if (typeof options === 'string') {
        options = {
            protocol: options
        };
    }

    var protocol = protocols[options.protocol];
    protocol = protocol || protocols.http;

    return {
        send: function(serviceName, command, payload) {

            return discoverer.pick(serviceName)
                .then(function(serviceInfo) {
                    return protocol.send(serviceInfo, command, payload, options);
                });

        }
    };
    
};

exports.addProtocol = function(name, protocol) {
    protocols[name] = protocol;
};

// Creates a server. We use this function instead of creatting the server somewhere else so 
// that we can abstract what kind of server we use to communicate. We can handle http or sockets
// without modifiyng the business logic
//
// After creating the server it returns an object with:
//
// *) A start function to start it
// *) A stop function to stop it
// *) A clear function to clear all endpoints
// *) An on function to handle incomming commands
//

exports.serve = function(options) {

    options = options || {};

    var protocol = protocols[options.protocol];
    protocol = protocol || protocols.http;

    var handler = protocol.init(options);

    return {

        on: function(command, callback) {
            return handler.on(command, callback);
        },

        start: function() {
            return handler.start();
        },

        stop: function() {
            return handler.stop();
        },

        clear: function() {
            return handler.clear();
        }



    };

};


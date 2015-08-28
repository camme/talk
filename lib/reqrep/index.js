var balancer = require('./balancer');
var Promise = require('es6-promise').Promise;

var protocols = {
    http: require('./protocol-http')
};

// Sends a command to the chosen service
exports.client = function(discoverer, protocolName) {

    var protocol = protocols[protocolName];
    protocol = protocol || protocols.http;

    return {
        send: function(serviceName, command, payload) {

            return discoverer.pick(serviceName)
                .then(function(serviceInfo) {
                    return protocol.send(serviceInfo, command, payload);
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

        send: function(serviceName, command, payload) {

            return balancer.pick(serviceName)
                .then(function(serviceInfo) {
                    return protocol.send(serviceInfo, command, payload);
                });

        }

    };

};


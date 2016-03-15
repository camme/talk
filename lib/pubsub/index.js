var Promise = require('es6-promise').Promise;

// This is the request http protocol
var protocol = require('./protocol-redis-pubsub');

module.exports = function(options) {

    options = options || {};

    var channel = protocol.channel(options);

    return {

        on: function(command, callback) {
            return channel.on(command, callback);
        },

        emit: function(command, callback) {
            return channel.emit(command, callback);
        },

        open: function() {
            return channel.open();
        },

        close: function() {
            var promise = new Promise(function(resolve, reject) {
                channel.close();
                resolve();
            });
            return promise;
        }

    };

};


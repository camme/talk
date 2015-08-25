var redis = require('redis');
var json = require('json-promise');
var Promise = require('es6-promise').Promise;

exports.channel = function(options) {

    var subscriber = redis.createClient(6379, 'redis');
    var publisher = redis.createClient(6379, 'redis');

    subscriber.on('error', function (err) {
        console.log("REDIS ERROR,",  err.stack);
    });

    publisher.on('error', function (err) {
        console.log("REDIS ERROR,",  err.stack);
    });

    return {
        
        emit: function(command, payload) {

            return json.stringify(payload)
                .then(function(data) {

                    var promise = new Promise(function(resolve, reject) {

                        publisher.publish(command, data, function(err) {
                            if (err) {
                                return reject(err);
                            }
                            resolve();
                        });

                    });

                    return promise;

                });

        },

        on: function(command, callback) {

            subscriber.on('message', function(event, data) {

                if (command === event) {

                    return json.parse(data)
                        .then(function(payload) {

                            var promise = callback(payload);

                            if (!promise || !promise.then) {
                                throw new Error('The callback of an channel.on listener must return a promise');
                            }

                            return promise;

                        });
 
                }

            });

            subscriber.subscribe(command);
            
        },

        // The connectiosn are already started as soon as we ask for the clients
        open: function() {
            var promise = new Promise(function(resolve, reject) {
                resolve();
            });
            return promise;
        },

        close: function() {
            var promise = new Promise(function(resolve, reject) {
                subscriber.unsubscribe();
                subscriber.end();
                publisher.end();
                resolve();
            });
            return promise;
        }



    };

};



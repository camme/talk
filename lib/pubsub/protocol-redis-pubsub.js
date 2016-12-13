
var redis = require('redis');
var json = require('json-promise');
var Promise = require('es6-promise').Promise;
var callbackList = {};

//var socketio = require('socket.io');
//var redis = require('socket.io-redis');

var redis = require("redis");

exports.channel = function(options) {

    var publisher, subscriber;

    //var promise = new Promise(function(resolve, reject) {

    var host = options.host || '127.0.0.1';
    var port = options.port || 6379;

    subscriber = redis.createClient(port, host);
    publisher  = redis.createClient(port, host);

    subscriber.on('error', function(err) {
        if (options.onError) {
            options.onError(err);
        } else {
            console.log('Talk cannot connect to redis', err);
        }
    });

    publisher.on('error', function(err) {
        if (options.onError) {
            options.onError(err);
        } else {
            console.log('Talk cannot connect to redis', err);
        }
    });


    subscriber.on('message', function(event, message) {

        var callbacks = callbackList[event];

        if (callbacks) {

            callbacks.forEach(function(callback) {
                json.parse(message)
                    .then(function(payload) {
                        callback(payload);
                    })
                    .catch(console.error);
            });

        }

    });

        //resolve();

        //});
 
    return {

        emit: function(event, payload) {
            return json.stringify(payload)
                .then(function(data) {
                    var promise = new Promise(function(resolve, reject) {
                        // console.log('emit ', event, data);
                        publisher.publish(event, data);
                        resolve();
                    });
                    return promise;
                });
        },

        on: function(event, callback) {
            if (!callbackList[event]) {
                callbackList[event] = [];
            }
            callbackList[event].push(callback);
            subscriber.subscribe(event);
        },

        // The connectiosn are already started as soon as we ask for the clients
        open: function() {

       },

        close: function() {
            var promise = new Promise(function(resolve, reject) {
                io.close();
                resolve();
            });
            return promise;
        }



    };

};

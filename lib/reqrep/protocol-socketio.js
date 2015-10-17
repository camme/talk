var json = require('json-promise');
var socketIO = require('socket.io');

var Promise = require('es6-promise').Promise;

var querystring = require('querystring');
var http = require('http');
var fs = require('fs');

var connections = {};
exports.send = function(serviceInfo, command, payload) {

    return new Promise(function(resolve, reject) {

        var address = 'http://' + serviceInfo.host + ':' + serviceInfo.port;
        var options = { forceNew: true, transports: [ 'websocket' ] };
        var socket = require('socket.io-client')(address, options);

        if (!connections[address]) {

            socket.emit(command, payload, function(result) {
                resolve(result);
            });
 
            socket.on('connect', function(){
                connections[address] = socket;
            });

            socket.on('error', function(err){
                console.log('error', err);
                socket.close();
                delete connections[address];
            });


            socket.on('disconnect', function(){
                console.log('socket disconnected');
                socket.close();
                delete connections[address];
            });

            socket.on('connect_timeout', function(err) {
                console.log('Connection error', err);
                delete connections[address];
                console.log('connections', connections);
                socket.close();
                reject(err);
            });
 
            socket.on('connect_error', function(err) {
                console.log('Connection error', err);
                delete connections[address];
                socket.close();
                reject(err);
            });
  
            socket.on('reconnecting', function() {
                console.log('Reconnecting error', address);
            });
            socket.on('reconnect_error', function(err) {
                console.log('Reconnecting error', address); //, err);
                delete connections[address];
                socket.close();
             });
            socket.on('reconnect_failed', function() {
                console.log('Reconnecting error', address);
            });

        } else {
            socket.emit(command, payload, function(result) {
                if (result.error === true) {
                    return reject(result.errorContent);
                }
                resolve(result);
            });
        }

    });

};

exports.init = function(options) {

    var server;
    var app = require('http').createServer();
    var io = require('socket.io')(app);
    var ons = [];
    io.set('transports', ["websocket"]);
    io.on('connection', function(socket) {

        ons.forEach(function(action) {
            
            socket.on(action.command, function(payload, send) {
                
                var promise = action.callback(payload);
                if (!promise || !promise.then) {
                    throw new Error('The callback of an server.on listener must return a promise');
                }

                return promise
                    .then(function(result) {

                        result = result || {};

                        // Check if the result isnt json. If thats the case
                        // throw an error
                        if (!isJsonString(result)) {
                            throw new Error('Result from callback promise isnt in JSON format');
                        }

                        send(result);

                    })
                    .catch(function(err) {
                        send({error: true, errorContent: err});
                    });

            });            


        });


    });

    return {

        on: function(command, callback) {
            ons.push({
                command: command, 
                callback: callback
            });
        },

        start: function() {

            var promise = new Promise(function(resolve, reject) {

console.log('started');

                server = app.listen(options.port || process.env.PORT || 8080, function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });

            });

            return promise;

        },

        stop: function() {

            var promise = new Promise(function(resolve, reject) {
                if (!server) {
                    return reject(new Error('Server has not started'));
                }
                server.close();
                server = null;
                resolve();
            });

            return promise;

        }






    };


};

function isJsonString(result) {
    var stringResult = JSON.stringify(result);
    try {
        JSON.parse(stringResult);
    } catch (e) {
        return false;
    }
    return true;
}




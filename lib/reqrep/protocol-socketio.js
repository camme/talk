var json = require('json-promise');
var socketIO = require('socket.io');

var Promise = require('es6-promise').Promise;

var querystring = require('querystring');
var http = require('http');
var fs = require('fs');
var zlib = require('zlib');

var connections = {};

function clientSend(socket, command, payload, options, callback) {
    if (options.gzip && payload) {
        var stringified = JSON.stringify(payload);
        zlib.deflate(JSON.stringify(payload), function(err, buffer) {
            var buffer = buffer.toString('base64');
            socket.emit(command, {_zip: true, buffer: buffer}, callback);
        });
    } else if (options.binary) {
        socket.emit(command, {_binary: true, buffer: payload}, callback);
    } else {
        var stringified = JSON.stringify(payload);
        socket.emit(command, payload, callback);
    }
}

exports.send = function(serviceInfo, command, payload, options) {

    return new Promise(function(resolve, reject) {

        var address = 'http://' + serviceInfo.host + ':' + serviceInfo.port;
        var socketOptions = { forceNew: true, transports: [ 'websocket' ] };
        var socket = require('socket.io-client')(address, socketOptions);

        if (!connections[address]) {

            clientSend(socket, command, payload, options, function(result) {
                return parseResult(result, resolve, reject);
            });

            socket.on('connect', function(){
                connections[address] = socket;
            });

            socket.on('error', function(err){
                socket.close();
                delete connections[address];
            });

            socket.on('disconnect', function(){
                socket.close();
                delete connections[address];
            });

            socket.on('connect_timeout', function(err) {
                delete connections[address];
                socket.close();
                reject(err);
            });

            socket.on('connect_error', function(err) {
                delete connections[address];
                socket.close();
                reject(err);
            });

            socket.on('reconnecting', function() {
            });

            socket.on('reconnect_error', function(err) {
                delete connections[address];
                socket.close();
            });

            socket.on('reconnect_failed', function() {
            });

        } else {
            clientSend(socket, command, payload, options, function(result) {
                return parseResult(result, resolve, reject);
            });
        }

    });

};

function parseResult(result, resolve, reject) {
    if (result._error === true) {

        result.errorContent.remote = true;

        var error = new Error(result.errorContent.message);
        error.stack = result.errorContent.stack;
        error.type = 'remote';

        return reject(error);

    }
    if (result._zip) {
        zlib.unzip(new Buffer(result.buffer, 'base64'), function(err, buffer) {
            if (err) {
                return reject(err);
            }
            var data = JSON.parse(buffer.toString());
            resolve(data);
        });
    } else {
        resolve(result);
    }
}



exports.init = function(options) {

    var server;
    var app = require('http').createServer();
    var io = require('socket.io')(app);
    var ons = [];

    io.set('transports', ["websocket"]);
    io.on('connection', function(socket) {

        ons.forEach(function(action) {

            socket.on(action.command, function(payload, send) {

                var promise;

                if (!payload || (!payload._zip && !payload._binary)) {
                    promise = action.callback(payload, { gzip: false, });
                    if (!promise || !promise.then) {
                        throw new Error('The callback of an server.on listener for "' + action.command + '" must return a promise');
                    }
                } else if (payload._zip) {

                    promise = new Promise(function(resolve, reject) {
                        zlib.unzip(new Buffer(payload.buffer, 'base64'), function(err, buffer) {
                            if (err) {
                                return reject(err);
                            }
                            var data = JSON.parse(buffer.toString());
                            resolve(data);
                        });
                    })

                    .then(function(unzipedPayload) {
                        var actionPromise = action.callback(unzipedPayload, { gzip: true });
                        if (!actionPromise || !actionPromise.then) {
                            throw new Error('The callback of an server.on listener for "' + action.command + '" must return a promise');
                        }
                        return actionPromise;
                    });

                } else if (payload._binary) {
                    return action.callback(payload.buffer, { binary: true });
                }




                return promise
                    .then(function(result) {

                        result = result || {};

                        // Check if the result isnt json. If thats the case
                        // throw an error
                        if (!isJsonString(result)) {
                            throw new Error('Result from callback promise isnt in JSON format');
                        }

                        if (options.gzip) {
                            zlib.deflate(JSON.stringify(result), function(err, buffer) {
                                var buffer = buffer.toString('base64');
                                send({_zip: true, buffer: buffer});
                            });
                        } else {
                            send(result);
                        }

                    })
                    .catch(function(err) {
                        // Append a remote flag so we always know that the error arrived from somewhere else
                        send({_error: true, errorContent: {message: err.message, stack: err.stack}});
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

                server = app.listen(options.port || process.env.PORT || 8080, function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });

            });

            return promise;

        },

        clear: function() {

            var promise = new Promise(function(resolve, reject) {
                ons = [];
                resolve();
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




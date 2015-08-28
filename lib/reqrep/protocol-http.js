var json = require('json-promise');
var requestPromise = require('request-promise');
var express = require('express');
var bodyParser = require('body-parser');

exports.send = function(serviceInfo, command, payload) {

    // This implementation of the send command uses
    // an http post request
    var options = {
        uri : 'http://' + serviceInfo.uri + '/' + command,
        method : 'POST',
        json: payload
    };

    return requestPromise(options)
        .then(function(result) { 
            return json.parse(result);
        });

};

exports.init = function(options) {

    var server;
    var app = express();

    // Since we send every payload as json, lets handle json
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    return {

        on: function(command, callback) {

            // Every command is a post since we want to handle the data in a single way
            console.log("ADD");
            app.use('/' + command, function(req, res, next) {

                var payload = req.body;

                var promise = callback(payload);

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

                        res.json(result);

                    })
                    .catch(next);

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

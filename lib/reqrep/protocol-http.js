var json = require('json-promise');
//var request = require('request');
var express = require('express');
var Promise = require('es6-promise').Promise;
var bodyParser = require('body-parser');

var querystring = require('querystring');
var http = require('http');
var fs = require('fs');

exports.send = function(serviceInfo, command, payload) {

    //console.time('one request');

    // This implementation of the send command uses
    // an http post request
    var options = {
        host: serviceInfo.host,
        port: serviceInfo.port,
        path: '/' + command,
        method : 'POST',
        headers: {
            'content-type': 'application/json'
        }
     };

    return new Promise(function(resolve, reject) {

        // Set up the request
        var postRequest = http.request(options, function(res) {

            var result = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                result += chunk;
                //console.log('Response: ' + chunk);
            });
            res.on('end', function () {
                //console.log('Response: ' + result);
                //console.timeEnd('one request');
                resolve(JSON.parse(result));
            });
            res.on('error', function (err) {
                reject(err);
            });

        });

        // post the data
        postRequest.write(payload ? JSON.stringify(payload) : '');
        postRequest.end();

    });

    return new Promise(function(resolve, reject) {

        console.time('one request');
        request(options, function(err, req, body) {
            console.timeEnd('one request');
            if (err) {
                return reject(err);
            }
            if (req.statusCode !== 200) {
                return reject(body);
            }
            json.parse(body)
                .then(function(data) {
                    resolve(data); 
                })
                .catch(reject);

        });


    });

};

exports.init = function(options) {

    var server;
    var app = express();

    // Since we send every payload as json, lets handle json
    // This take almost 500 ms to do, dont know why
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

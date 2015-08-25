var Promise = require('es6-promise').Promise;

var serviceList = originalServiceList = {
    'sorter': [{uri: 'localhost:12345'}],
    'users': [{uri: 'localhost:12346'}]
};

// This exists so we can overide the list when testing
exports.setList = function(list) {
    serviceList = list;
};

exports.restoreList = function() {
    serviceList = originalServiceList;
};

exports.get = function(serviceName) {

    var promise = new Promise(function(resolve, reject) {

        var serviceInstanceList = serviceList[serviceName];

        if (!serviceInstanceList) {
            return reject(new Error('service-not-found'));
        }

        resolve(serviceInstanceList);

    });

    return promise;

};








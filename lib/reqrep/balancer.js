var services = require('../services');

exports.pick = function(serviceName) {

    return services.get(serviceName)
        .then(function(list) {

            // super complex balancing algorithm
            var serviceInstance = list[0];

            if (!serviceInstance) {
                new Error('no-service-instance-found');
            }

            return serviceInstance;

        });

};



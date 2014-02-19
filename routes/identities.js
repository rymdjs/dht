module.exports = function(app, options) {

    var _ = require('underscore'),
	    nmc = options.nmc,
        settings = options.settings,
        endpoints = {};

    var getEndpoints = function(id) {
        return endpoints[id] || {};
    };

    var fetchPubKeys = function(id, onDone, onError) {
		var keyNames = ['ssh-rsa'];
		nmc.cmd('name_show', settings.nmcNamespace+'/'+id, function(err, data) {
            if (err) {
                onError(err);
                return;
            }
            var val = JSON.parse(data.value),
                result = {};
            console.log(val);
            for(var i=0; i<keyNames.length; i++) {
                var key = keyNames[i];
                if(val.hasOwnProperty(key)) {
                    result[key] = val[key];
                }
            }
            onDone(result);
        });
    };

    //ROUTES
    var addEndpoint = function(req, res, next) {
        var id = req.params[0];
        try {
            var endpoint = JSON.parse(req.body);
        } catch(e) {
            res.send(500, {});
            return next();
        }
        if(typeof endpoints[id] === 'undefined') {
            endpoints[id] = {}
        };
        var eps = endpoints[id];
        endpoint.lastSeen = Date.now();
        eps[endpoint.id] = endpoint;
        res.send(200, {});
        return next();
    };

	var findIdentity = function(req, res, next) {
		res.setHeader('Access-Control-Allow-Origin','*');
		var id = req.params[0],
            result = {
                id: id,
                endpoints: getEndpoints(id)
            };
		console.log('querying "'+id+'"');
        fetchPubKeys(id,
            function(keys) {
                result = _.extend(result, keys);
                res.send(200, result);
            },
            function(err) {
                if(err.code === -4) {
                    console.log('Id '+id+' not found in db.');
                    res.send(404, {});
                } else {
                    console.log(err);
                    res.send(500, {});
                }
            }
        );
		return next();
	};

	return {
		findIdentity: findIdentity,
        addEndpoint: addEndpoint
	};
};

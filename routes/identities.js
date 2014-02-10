module.exports = function(app, options) {

	var nmc = options.nmc;
	var settings = options.settings;

	var findIdentity = function(req, res, next) {
		res.setHeader('Access-Control-Allow-Origin','*');
		var id = req.params[0];
		var keys = ['ssh-rsa'];
		console.log('querying "'+id+'"');
		nmc.cmd('name_show', settings.nmcNamespace+'/'+id, function(err, data) {
			if (err && err.code == -4) {
				console.log('Id '+id+' not found in db.');
				res.send(200, {id: id});
				return;
			}
			if (err) {
				console.log(err);
				res.send(200, {});
				return;
			}
			var val = JSON.parse(data.value);
			console.log(val);
			var result = {id: id};
			for(var i=0; i<keys.length; i++) {
				var key = keys[i];
				if(val.hasOwnProperty(key)) {
					result[key] = val[key];
				}
			}
			res.send(200, result);
		});
		return next();
	};

	return {
		findIdentity: findIdentity
	};
};

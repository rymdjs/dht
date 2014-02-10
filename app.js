var restify = require('restify');
var nmcRPC = require('nmcRPC');
var settings = require('./settings.js');

var server = restify.createServer({
	name: 'nmc'
});

var nmc = new nmcRPC.Client(settings.nmc);

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());

var identities = require('./routes/identities')(server, {'nmc': nmc, 'settings': settings});

server.get({path: /^\/identities\/([0-9a-zA-Z-_.]+)$/, version: '0.0.1'}, identities.findIdentity);

server.listen(settings.port, settings.ip, function(){
	console.log('%s listening on %s', server.name, server.url);
});

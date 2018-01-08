var util = require('util') ;
var clone = require('clone') ;

// Only these methods are supported
var allowedOptions =
{
	accept: null,
	agent: null,
	attach: null,
	auth: null,
	buffer: null,
	ca: null,
	cert: null,
	clearTimeout: null,
	del: null,
	delete: null,
	field: null,
	get: null,
	getHeader: null,
	head: null,
	key: null,
	maxResponseSize: null,
	ok: null,
	on: null,
	once: null,
	options: null,
	parse: null,
	patch: null,
	pfx: null,
	pipe: null,
	post: null,
	put: null,
	query: null,
	redirects: null,
	request: null,
	responseType: null,
	retry: null,
	send: null,
	serialize: null,
	set: null,
	sortQuery: null,
	then: null,
	timeout: null,
	type: null,
	unset: null,
	use: null,
	withCredentials: null
} ;

// One and only one of these is required first
var requiredFirst =
[
	'get',
	'put',
	'post',
	'patch',
	'delete',
	'del',
	'request'
] ;

// Any of these but must go at end of call chain in the given order
// (although end & then/catch are mutually exclusive - superagent will catch this)
var requiredLast =
[
	'send',
	'end',
	'then',
	'catch'
] ;

function findFirst(options) {
	var req = [] ;
	for(var i = 0 ; i<requiredFirst.length ; i++) {
		if(requiredFirst[i] in options) {
			req.push(requiredFirst[i]) ;
			delete options[requiredFirst[i]] ;
		}
	}
	return req ;
}

function findLast(options) {
	var req = [] ;
	for(var i = 0 ; i<requiredLast.length ; i++) {
		if(requiredLast[i] in options) {
			req.push(requiredLast[i]) ;
			delete options[requiredLast[i]] ;
		}
	}
	return req ;
}

function SuperagentOptions(superagent, options) {
	// Our own copy to mutate
	var opts = clone(options) ;

	// Check only valid options provided
	for(var opt in opts) {
		if(!allowedOptions.hasOwnProperty(opt)) 
			throw new Error('Invalid option "'+opt+'" supplied') ;
		
	}

	// Determine which option goes first according to superagent API
	var firstMethod = findFirst(opts) ;
	// if(firstMethod.length < 1)
	// 	throw new Error('Must provide one of: '+requiredFirst.join(',')) ;
	if(firstMethod.length > 1)
		throw new Error('Must provide only one of: '+requiredFirst.join(',')+' but the following were provided: '+firstMethod.join(',')) ;

	var agent = superagent ;
	if(firstMethod.length) {
		firstMethod = firstMethod[0] ;

		// Create superagent instance with first option
		agent = call(agent, firstMethod, options[firstMethod]) ;

	}

	// Determine which option/s go last according to superagent API
	var lastMethods = findLast(opts) ;

	// Apply remaining methods to this instance
	for(var method in opts) 
		agent = call(agent, method, opts[method]) ;
	

	// Finalise with any last options
	lastMethods.forEach(function(method){
		agent = call(agent, method, options[method]) ;
	}) ;

	// return
	return agent ;
}

function call(agent, methodName, parameters) {
	console.warn(`parameters=${util.inspect(parameters)}`) ;
	if(!Array.isArray(parameters))
		parameters = [].concat(parameters) ;

	console.warn(`agent=${util.inspect(agent)}`) ;
	var args = [] ;
	parameters.forEach(function(param) {
		if(args.length === 0 && Array.isArray(param)) {
			console.warn(`${methodName}(${param.join(',')})`) ;
			agent = agent[methodName].apply(agent, param) ;
		}
		else {
			args.push(param) ;
		}
	}) ;
	if(args.length > 0) {
		console.warn(`${methodName}(${args.join(',')})`) ;
		agent = agent[methodName].apply(agent, args) ;
	}

	return agent ;
}

module.exports = SuperagentOptions ;

/*
request.get('/search')

request({
	get: '/search'
}) ;
-------------------------------------------------------------------------------
request.query({ email: 'joe@smith.com' })

request({
	query: { email: 'joe@smith.com' }
}) ;
-------------------------------------------------------------------------------
request
.query('search=Manny')
.query('range=1..5')

request({
	query: [ ['search=Manny'], ['range=1..5'] ]
}) ;
-------------------------------------------------------------------------------
request
.query({ query: 'Manny' })
.query({ range: '1..5' })
.query({ order: 'desc' })

request({
	query: [ [{ query: 'Manny' }], [{ range: '1..5' }], [{ order: 'desc' }] ]
}) ;
-------------------------------------------------------------------------------
request.set('API-Key', 'foobar')

request({
	set: ['API-Key', 'foobar']
}) ;
-------------------------------------------------------------------------------
request
.set('API-Key', 'foobar')
.set('Accept', 'application/json')

request({
	set: [ ['API-Key', 'foobar'], ['Accept', 'application/json'] ]
}) ;
-------------------------------------------------------------------------------
request
.post('/upload')
.field('user[name]', 'Tobi')
.field('user[email]', 'tobi@learnboost.com')
.field('friends[]', ['loki', 'jane'])
.attach('image', 'path/to/tobi.png')
.then(callback);

request({
	post: '/upload',
	field: [
		['user[name]', 'Tobi'],
		['user[email]', 'tobi@learnboost.com'],
		[ friends[]', ['loki', 'jane'] ],
	],
	attach: ['image', 'path/to/tobi.png'],
	then: callback
}) ;

 */

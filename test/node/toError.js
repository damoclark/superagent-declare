'use strict' ;
const request = require('superagent'),
	express = require('express'),
	assert = require('assert'),
	app = express() ;

app.get('/', (req, res) => {
	res.status(400).send('invalid json') ;
}) ;

let base = 'http://localhost' ;
let server ;
before(function listen(done) {
	server = app.listen(0, function listening() {
		base += `:${server.address().port}` ;
		done() ;
	}) ;
}) ;

/*eslint no-undef:0*/
/*eslint no-unused-vars:0*/
describe('res.toError()', () => {
	it('should return an Error', done => {
		request.get(base).end((err, res) => {
			var error = res.toError() ;
			assert.equal(error.status, 400) ;
			assert.equal(error.method, 'GET') ;
			assert.equal(error.path, '/') ;
			assert.equal(error.message, 'cannot GET / (400)') ;
			assert.equal(error.text, 'invalid json') ;
			done() ;
		}) ;
	}) ;
}) ;

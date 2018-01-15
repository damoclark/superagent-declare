'use strict' ;
const request = require('superagent') ;

/*eslint no-undef:0*/
/*eslint no-unused-vars:0*/
describe('exports', () => {
	it('should expose .protocols', () => {
		Object.keys(request.protocols).should.eql(['http:', 'https:']) ;
	}) ;

	it('should expose .serialize', () => {
		Object.keys(request.serialize).should.eql([
			'application/x-www-form-urlencoded',
			'application/json',
		]) ;
	}) ;

	it('should expose .parse', () => {
		Object.keys(request.parse).should.eql([
			'application/x-www-form-urlencoded',
			'application/json',
			'text',
			'application/octet-stream',
			'application/pdf',
			'image',
		]) ;
	}) ;
}) ;

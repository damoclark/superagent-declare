var setup = require('./support/setup') ;
var NODE = setup.NODE ;
var uri = setup.uri ;

var should = require('should') ;
var assert = require('assert') ;
var superagent = require('superagent') ;
var request = require('../') ;
request.use(superagent) ;

/*eslint no-undef:0*/
/*eslint no-unused-vars:0*/
describe('superagent-declare', function(){
	this.timeout(20000) ;

	describe('use()', function() {
		it('should not throw when superagent provided to superagent-declare without calling use()', function(done) {
			request({
				get: [
					uri + '/login', function(err, res) {
						assert.equal(res.status, 200) ;
						done() ;
					}
				]
			}, superagent) ;
		}) ;

		it('should throw when no superagent provided', function(done) {
			request.use() ;
			try {
				request({
					get: [
						uri + '/login', function(err, res) {
							assert.fail() ;
							done() ;
						}
					]
				}) ;
			}
			catch(err) {
				done() ;
			}
		}) ;


		it('should not throw when superagent provided by calling use()', function(done) {
			request.use(superagent) ;
			request({
				post: [ uri + '/echo', { foo: 'bar' } ],
				end: function(err, res) {
					assert.equal('{"foo":"bar"}', res.text) ;
					done() ;
				}
			}) ;
		}) ;

	}) ;
}) ;

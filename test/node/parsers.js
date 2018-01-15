'use strict' ;
const assert = require('assert') ;
const request = require('superagent') ;
const setup = require('../support/setup') ;
const base = setup.uri ;

/*eslint no-undef:0*/
/*eslint no-unused-vars:0*/
describe('req.parse(fn)', () => {
	it('should take precedence over default parsers', done => {
		request
		.get(`${base}/manny`)
		.parse(request.parse['application/json'])
		.end((err, res) => {
			assert(res.ok) ;
			assert.equal('{"name":"manny"}', res.text) ;
			assert.equal('manny', res.body.name) ;
			done() ;
		}) ;
	}) ;

	it('should be the only parser', () =>
		request
		.get(`${base}/image`)
		.parse((res, fn) => {
			res.on('data', () => {}) ;
		})
		.then(res => {
			assert(res.ok) ;
			assert.strictEqual(res.text, undefined) ;
			res.body.should.eql({}) ;
		})) ;

	it('should emit error if parser throws', done => {
		request
		.get(`${base}/manny`)
		.parse(() => {
			throw new Error('I am broken') ;
		})
		.on('error', err => {
			err.message.should.equal('I am broken') ;
			done() ;
		})
		.end() ;
	}) ;

	it('should emit error if parser returns an error', done => {
		request
		.get(`${base}/manny`)
		.parse((res, fn) => {
			fn(new Error('I am broken')) ;
		})
		.on('error', err => {
			err.message.should.equal('I am broken') ;
			done() ;
		})
		.end() ;
	}) ;

	it('should not emit error on chunked json', done => {
		request.get(`${base}/chunked-json`).end(err => {
			assert(!err) ;
			done() ;
		}) ;
	}) ;

	it('should not emit error on aborted chunked json', done => {
		const req = request.get(`${base}/chunked-json`).end(err => {
			assert.ifError(err) ;
			done() ;
		}) ;

		setTimeout(() => {
			req.abort() ;
		}, 50) ;
	}) ;

	it('should not reject promise on aborted chunked json', () => {
		const req = request.get(`${base}/chunked-json`) ;
		setTimeout(() => {
			req.abort() ;
		}, 50) ;
		return req ;
	}) ;
}) ;

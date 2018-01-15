'use strict' ;

const request = require('superagent') ;
const express = require('express') ;
const assert = require('assert') ;
const app = express() ;
const url = require('url') ;
const https = require('https') ;
const fs = require('fs') ;
const ca = fs.readFileSync(`${__dirname}/fixtures/ca.cert.pem`) ;
const key = fs.readFileSync(`${__dirname}/fixtures/key.pem`) ;
const pfx = fs.readFileSync(`${__dirname}/fixtures/cert.pfx`) ;
const cert = fs.readFileSync(`${__dirname}/fixtures/cert.pem`) ;
const passpfx = fs.readFileSync(`${__dirname}/fixtures/passcert.pfx`) ;
let server ;

app.get('/', (req, res) => {
	res.send('Safe and secure!') ;
}) ;

// WARNING: this .listen() boilerplate is slightly different from most tests
// due to HTTPS. Do not copy/paste without examination.
const base = 'https://localhost' ;
let testEndpoint ;

/*eslint no-undef:0*/
/*eslint no-unused-vars:0*/
describe('https', () => {
	describe('certificate authority', () => {
		before(function listen(done) {
			server = https.createServer(
				{
					key,
					cert,
				},
				app
			) ;
			server.listen(0, function listening() {
				testEndpoint = `${base}:${server.address().port}` ;
				done() ;
			}) ;
		}) ;

		after(() => {
			server.close() ;
		}) ;

		describe('request', () => {
			it('should give a good response', done => {
				request
				.get(testEndpoint)
				.ca(ca)
				.end((err, res) => {
					assert(res.ok) ;
					assert.strictEqual('Safe and secure!', res.text) ;
					done() ;
				}) ;
			}) ;
		}) ;

		describe('.agent', () => {
			it('should be able to make multiple requests without redefining the certificate', done => {
				const agent = request.agent({ ca }) ;
				agent.get(testEndpoint).end((err, res) => {
					assert(res.ok) ;
					assert.strictEqual('Safe and secure!', res.text) ;
					agent.get(url.parse(testEndpoint)).end((err, res) => {
						assert(res.ok) ;
						assert.strictEqual('Safe and secure!', res.text) ;
						done() ;
					}) ;
				}) ;
			}) ;
		}) ;
	}) ;

	describe('client certificates', () => {
		before(function listen(done) {
			server = https.createServer(
				{
					ca,
					key,
					cert,
					requestCert: true,
					rejectUnauthorized: true,
				},
				app
			) ;
			server.listen(0, function listening() {
				testEndpoint = `${base}:${server.address().port}` ;
				done() ;
			}) ;
		}) ;

		after(() => {
			server.close() ;
		}) ;

		describe('request', () => {
			it('should give a good response with client certificates and CA', done => {
				request
				.get(testEndpoint)
				.ca(ca)
				.key(key)
				.cert(cert)
				.end((err, res) => {
					assert(res.ok) ;
					assert.strictEqual('Safe and secure!', res.text) ;
					done() ;
				}) ;
			}) ;
			it('should give a good response with client pfx', done => {
				request
				.get(testEndpoint)
				.pfx(pfx)
				.end((err, res) => {
					assert(res.ok) ;
					assert.strictEqual('Safe and secure!', res.text) ;
					done() ;
				}) ;
			}) ;
			it('should give a good response with client pfx with passphrase', done => {
				request
				.get(testEndpoint)
				.pfx({
					pfx: passpfx,
					passphrase: 'test',
				})
				.end((err, res) => {
					assert(res.ok) ;
					assert.strictEqual('Safe and secure!', res.text) ;
					done() ;
				}) ;
			}) ;
		}) ;

		describe('.agent', () => {
			it('should be able to make multiple requests without redefining the certificates', done => {
				const agent = request.agent({ ca, key, cert }) ;
				agent.get(testEndpoint).end((err, res) => {
					assert(res.ok) ;
					assert.strictEqual('Safe and secure!', res.text) ;
					agent.get(url.parse(testEndpoint)).end((err, res) => {
						assert(res.ok) ;
						assert.strictEqual('Safe and secure!', res.text) ;
						done() ;
					}) ;
				}) ;
			}) ;
			it('should be able to make multiple requests without redefining pfx', done => {
				const agent = request.agent({ pfx }) ;
				agent.get(testEndpoint).end((err, res) => {
					assert(res.ok) ;
					assert.strictEqual('Safe and secure!', res.text) ;
					agent.get(url.parse(testEndpoint)).end((err, res) => {
						assert(res.ok) ;
						assert.strictEqual('Safe and secure!', res.text) ;
						done() ;
					}) ;
				}) ;
			}) ;
		}) ;
	}) ;
}) ;

'use strict' ;
const request = require('superagent') ;
const setup = require('../support/setup') ;
const base = setup.uri ;
const fs = require('fs') ;

/*eslint no-undef:0*/
/*eslint no-unused-vars:0*/
describe('pipe on redirect', () => {
	const destPath = 'test/node/fixtures/pipe.txt' ;

	after(function removeTmpfile(done) {
		fs.unlink(destPath, done) ;
	}) ;

	it('should follow Location', done => {
		const stream = fs.createWriteStream(destPath) ;
		const redirects = [] ;
		const req = request.get(base).on('redirect', res => {
			redirects.push(res.headers.location) ;
		}) ;
		stream.on('finish', () => {
			redirects.should.eql(['/movies', '/movies/all', '/movies/all/0']) ;
			fs.readFileSync(destPath, 'utf8').should.eql('first movie page') ;
			done() ;
		}) ;
		req.pipe(stream) ;
	}) ;
}) ;

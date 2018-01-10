# superagent-declare

[![NPM](https://nodei.co/npm/superagent-declare.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/superagent-declare/)


## Summary

Go from this:

```javascript
const request = require('superagent') ;

request
.post('/upload')
.field('user[name]', 'Tobi')
.field('user[email]', 'tobi@learnboost.com')
.field('friends[]', ['loki', 'jane'])
.attach('image', 'path/to/tobi.png')
.then(callback) ;
```

to this:

```javascript
const superagent = require('superagent') ;
const request = require('superagent-declare') ;
request.use(superagent) ;

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
```

## Overview

Superagent-declare provides a [declarative](https://codeburst.io/declarative-vs-imperative-programming-a8a7c93d9ad2) 
and [uncurried](https://medium.com/@JosephJnk/currying-and-uncurrying-in-javascript-and-flow-98877c8274ff) API for the 
fantastic superagent module.  

Why?  The primary driver for writing this module is to be able to store a declarative representation of all the request
parameters without having to define them as lines of javascript code.  As an example, you are able to store these 
request parameters in a configuration file.  Furthermore, the request parameters declared in the data structure
can be specified in any order.

## Installation

The usual:

```bash
npm install superagent-declarative superagent
```

Superagent-declare does not itself include superagent as a dependency.  Although it does for dev-dependencies
(primarily for unit testing).  So you will need to install both alongside one another in your module/app.

## Usage

The interface to superagent-declare is very simple.  Use the following pattern:

```javascript
const superagent = require('superagent') ;
const request = require('superagent-declare') ;
request.use(superagent) ;

request({ /* Usual superagent API options here */ }) ;

// or without calling request.use():

request({ /* Usual superagent API options here */ }, superagent) ;
```

The `request` call above will return an instance of superagent with the given methods invoked, but can then be further mutated.  In other words, you
do not need to define all the options for your request using superagent-declare, you can programmatically augment the
resulting object.  i.e. based on example in summary:

```javascript
request({
	post: '/upload',
	field: [
		['user[name]', 'Tobi'],
		['user[email]', 'tobi@learnboost.com'],
		['friends[]', ['loki', 'jane'] ],
	],
	attach: ['image', 'path/to/tobi.png']
})
.then(callback) ;
```

Use of superagent and declare APIs can be intermixed - you are not locked into the declare API. i.e.

```javascript
const superagent = require('superagent') ;
const request = require('superagent-declare') ;
request.use(superagent) ;

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

// and can also call this way in same codebase

superagent
.post('/upload')
.field('user[name]', 'Tobi')
.field('user[email]', 'tobi@learnboost.com')
.field('friends[]', ['loki', 'jane'])
.attach('image', 'path/to/tobi.png')
.then(callback) ;
```

## Superagent-declare API Syntax

This section outlines how the superagent API translates into a declarative JS 
data structure that can be passed to superagent-declare.

Thee following definitions are used throughout:

method = superagent method name (e.g. send() or field())
argument = an argument or parameter passed to a method (e.g. '/upload' in post('/upload') )

The object literal passed to superagent-delcare has these forms.

### Call a method with no arguments or a single argument
* `method: []` Call method once with no arguments
* `method: 'argument'` Call method once with one argument
* `method: {'key': argument}` Call method once with one argument
* `method: [ [ [1, 2, 3] ] ]` Call method once with one argument being an array

```javascript
request({
	end: [], // Invoke the request and ignore the result
	post: '/upload',
	field: { 'friends[]', ['loki', 'jane'] },
	send: [ [ [1, 2, 3] ] ], //Send an array of values as body of request
}) ;
```

### Call a method with two or more arguments
* `method: [ 'arg1', 'arg2', ... ]` Call method once with two or more arguments
* `method: [ 'arg1', ['arg2 element 0', 'arg2 element 1'], ... ]` Call method once with two or more arguments

```javascript
request({
	// ...
	set: ['X-Foo', 'bar'],
	// ...
}) ;
```

### Call a method multiple times with one or multiple arguments
* `method: [ ['call1 arg1', 'call1 arg2'], ['call2 arg1', 'call2 arg2'],  ... ]` Call method two or more times with sub-array arguments

```javascript
request({
	// ...
	use: [ [uuid], [prefix] ],
	set: [ ['X-Foo', 'bar'], ['X-Bar', 'baz'] ],
	// ...
}) ;
```


## Examples

Following are many examples and patterns that show how to use the declarative API.

```javascript
request.get('/search')

request({
	get: '/search'
}) ;
//-------------------------------------------------------------------------------
request.query({ email: 'joe@smith.com' })

request({
	query: { email: 'joe@smith.com' }
}) ;
//-------------------------------------------------------------------------------
request
.query('search=Manny')
.query('range=1..5')

request({
	query: [ ['search=Manny'], ['range=1..5'] ]
}) ;
//-------------------------------------------------------------------------------
request
.query({ query: 'Manny' })
.query({ range: '1..5' })
.query({ order: 'desc' })

request({
	query: [ [{ query: 'Manny' }], [{ range: '1..5' }], [{ order: 'desc' }] ]
}) ;
//-------------------------------------------------------------------------------
request.set('API-Key', 'foobar')

request({
	set: ['API-Key', 'foobar']
}) ;
//-------------------------------------------------------------------------------
request
.set('API-Key', 'foobar')
.set('Accept', 'application/json')

request({
	set: [ ['API-Key', 'foobar'], ['Accept', 'application/json'] ]
}) ;
//-------------------------------------------------------------------------------
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
```

## Contributions


Contributions are most welcome.

## Licence

copyright


## Acknowledgements / Attribution

Many thanks to the team who created and maintain the [superagent](https://github.com/visionmedia/superagent) project.


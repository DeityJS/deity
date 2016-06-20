# Deity [![Build Status](https://travis-ci.org/DeityJS/deity.svg?branch=master)](https://travis-ci.org/DeityJS/deity)

Deity is a property generating tool for use when writing tests. It works well
with tools like mocha.

You can read my introductory article on Deity here: [Introducing Deity].

Given a string specifying a generator and arguments, Deity will call a given
function a number of times with data generated from the specified generator.

```js
deity('string:10-20', function (str) {
	// This function will be called 100 times (by default)
	// str will equal a string of random length between 10 and 20
});
```

You can give it any number of generator strings:

```js
deity('string:10-20', 'number:5-7', function (str, num) {
	// This function will be called 100 times
	// str will equal a string of random length between 10 and 20
	// num will equal a random number between 5 and 7
});
```

It also supports plugins, for example the [randomuser.me plugin]:

```js
deity('randomuser', function (user) {
	// user will equal an object representing a randomly generated user
});
```

You can play with different generator strings on the [Deity website] and read
the API documentation below.


## API

```
deity( ...generatorStrings [ , options ] , callback )
```

The first argument, `generatorString`, is a string containing the name of the
generator to use (for example, "string" or "number"), followed by some
arguments to give to the generator, all separated by colons. This argument can
be repeated as many times as you want.

The next argument is optional, and is an object where you can specify a
number of options to override the defaults with, such as the number of
time to call the callback.

The final argument should be the testing function to be called with the
generated data. If you specify multiple generator strings, each one will be
called as a separate argument of the function.

The Deity function returns a promise which is resolved or rejected depending
on whether any errors are thrown in the callback function.

## Usage with mocha

Calling the `deity()` function returns a promise which is either resolved or
rejected with any errors thrown inside the callback. To use Deity with mocha,
simply return the promise:

```js
it('should return the same value every time', function () {
	return deity('number:0-1000', function (num) {
		assert.equal(myFunc(num), myFunc(num));
	});
});
```

Note that in some cases when both the generator and testing function are
synchronous, you don't need to return the promise, because the errors will
be thrown normally.

## Types of generators

### string:length

The string generator generates strings of length n where n is a random number
between two specified numbers.

`string:5-10`, for example, will generate strings of random length between 5
and 10 characters.

The letters the string is generated from is by default the capital letters A-Z,
but this can be configured using the `letters` option (just specify a string of
characters to get the characters from).

```js
deity('string:5-10', { letters: 'ABCDEFG' }, function (str) {
	// str will contain 5-10 characters in the range "A-G".
});
```

If not specified, the default length of the string is 10-20.

### number:range:precision

This generator generates numbers within a given range of numbers at, if
specified, a given precision.

- `number:3.1-4.7` will generate random numbers between 3.1 and 4.7.
- `number:0-10:0.1` will generate random numbers between 0 and 10, rounded to
one decimal place.
- `number:0-1000:10` will generate random numbers between 0 and 1000, rounded
to the nearest ten.

The precision is optional: if not specified, the number will not be rounded
(and as such, is extremely unlikely to be an integer). The range is also
optional and defaults to "0-1".

### int:range

The int generator is very similar to the number generator, but only generates
whole numbers.

```js
deity('int:-20-30', function (num) {
	// num will equal random integers between -20 and 30.
});
```

The range again is optional, and defaults to "0-10".

### char:range

The char generator generates characters in a given range with a default of
"A-Z".

- `char` will generate random characters
- `char:A-M` will generate random characters in the first half of the alphabet.

### boolean:bias

The boolean generator generates true or false values with an optional bias. The
bias should be a number between 0 and 1. The closer the number to 1, the more
likely it is that "true" will be generated.

```js
deity('boolean:0.9', function (bool) {
	// bool will be true nine times out of ten
});
```

If the bias isn't specified, it will return true 50% of the time, and false the
remaining 50% of the time.

### oneOf:(...generators)

To explain the oneOf generator and a few of the generators below, we introduce
the concept of **subgenerators**. A subgenerator is a generator specified in
brackets given as an argument to another generator.

The oneOf generator takes a number of generators, and picks one of them
randomly to generate a value from. For example, take the following generator:

```js
deity('oneOf:(int:10-20):(char):(boolean:0.2)', function (value) {
	// What will value be?
});
```

In that example, the `value` variable will equal either:

- An integer between 10 and 20
- A character
- Or a boolean with a 20% chance of being true

### array:(...generators)

This generator is similar to the oneOf generator, but instead of picking one
of the generators, it uses all of them to generate an array where the first
element will be a value generated by the first generator, the second element
will be a value generated by the second generator, and so on.

```js
deity('array:(int:10-20):(char):(boolean:0.2)', function (value) {
	// value[0] will be an integer between 10 and 20
	// value[1] will be a character
	// value[2] will be a boolean with a 20% chance of being true
});
```

For example, `value` in that case could be `[15, 'F', false]`.

### repeat:n:generator

This generator generates the result of a given subgenerator called n times,
concatenated together as a string.

```js
deity('repeat:4:(char:A-F)', function (str) {
	// str will equal a string of length 4 containing only character "A-F".
});
```

### literal:json

The literal generator is mostly used internally. It takes a literal value and
returns that value every time.

- `literal:"test"` will generate "test" repeatedly.
- `literal:4` will generate "4" repeatedly.

Internally, it uses the JSON parser to turn the value into an object, so you
could specify more complicated values like arrays and objects.

### entry

The entry generator uses a given array or object to generate random values from
the array or object. As the generator string is a string, the collection is
specified in the options:

```js
deity('entry', { collection: [1, 3, 5] }, function (num) {
	// num will equal either 1, 3, or 5
});
```

The generator also has an argument to specify the name of the option to use,
but there aren't many cases you'd have to use it in:

```js
deity('entry:ary', { ary: [1, 3, 5] }, function (num) {
	// num will equal either 1, 3, or 5
});
```

## Special generators

A few generators have short forms you can use: 

### n*(generator)

Will expand out to `repeat:n:(generator)`.

### "literal string values"

Will expand out to `literal:"literal string values"`.

### Number and character ranges

You can specify number and character generators without the `number` and `char`
prefixes:

- `A-Z` will expand out to `char:A-Z`.
- `3.5-10` will expand out to `number:3.5-10`.

## Plugins and custom generators

@todo: document how to add generators

You can read how to create your own plugin in this article: (coming soon).
They're just ES6 generators, though:

```js
deity.extend('myGenerator', function* () {
	while (true) {
		yield 'This is the value given to the deity callback';
	}
});
```

There is only one plugin available right now:

- deity-plugin-randomuser - Uses [randomuser.me] to generate random users.

## Install

You can install Deity from npm:

```
$ npm install --save-dev deity
```

## License

Released under the MIT license.



[Introducing Deity]: http://macr.ae/article/introducing-deity.html
[Deity website]: http://deityjs.com/
[randomuser.me plugin]: https://github.com/DeityJS/deity-randomuser

# Deity

Deity is a property generator for use when writing tests. It works well with
tools like mocha.

```js
deity('number:10-20', function (num) {
	// This function will be called 100 times
	// num will equal a random number between 10 and 20 each time
});
```

Let's say we want to write a test to test our function `reverse()`, which takes
a string and returns the string backwards. Traditionally, we would do this:

```js
describe('reverse()', function () {
	it('should return reversed string', function () {
		assert.equal(reverse('abc'), 'cba');
		assert.equal(reverse('qwerty'), 'ytrewq');
		assert.equal(reverse('hello'), 'olleh');
	});
});
```

If you call the `reverse()` function twice, it is expected that the returned
string will equal the original function. Thus, we can rewrite the above test:

```js
describe('reverse()', function () {
	it('should return reversed string', function () {
		assert.equal(reverse(reverse('abc')), 'abc');
		assert.equal(reverse(reverse('qwerty')), 'qwerty');
		assert.equal(reverse(reverse('hello')), 'hello');
	});
});
```

It seems tedious and incomplete to write out three strings manually.

Enter Deity.

Deity can generate the string for you to test. The following will generate 100
random strings of lengths between 5 and 10 characters and test the `reverse()`
function with them:

describe('reverse()', function () {
	it('should return reversed string', function () {
		deity('string:5-10', function (str) {
			assert.equal(reverse(reverse(str)), str);
		});
	});
});
```

We now have 50 different tests for our function, all in one line.


## API

```
deity( generatorString [ , options ] , callback )
```

The first argument, `generatorString`, is a string containing the name of the
generator to use (for example, "string" or "number"), followed by some
arguments to give to the generator, all separated by colons.

The second argument is optional, and is an object where you can specify a
number of options to override the defaults with, such as the number of
time to call the callback.

The final argument should be the callback to be called with the generated data.

## Types of generators

Todo

- string:5-20
- number:0-1
- number:10-20:0.1
- int:0-10
- boolean:0.9
- array:(string:5-20):(number:0-1)
- entry:array
- entry:object
- string:(int:0-10)

- 5*(string:5-20)
- "literal values"
- 3-5

## Plugins and custom generators

- randomuser.me
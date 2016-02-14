import regeneratorRuntime from 'regenerator/runtime-module'; // eslint-disable-line
import deity from '../src/index';
import Range from '../src/range';
import generators from '../src/core-generators';

describe('Core generators', function () {
	before(function () {
		deity.extend('async', function* (options, val = 'test') {
			let promise = new Promise(function (resolve) {
				setTimeout(resolve, 20);
			});

			while (true) {
				yield promise.then(function () {
					return val;
				});
			}
		});
	});

	describe('string', function () {
		it('should return a string of random length', function () {
			let options = {
				letters: 'ABCDEFG'
			};

			let lettersArray = options.letters.split('');
			let stringGenerator = generators.string(options, '5-10');

			repeat(20, function () {
				let randomString = stringGenerator.next().value;
				randomString.length.should.be.within(5, 10);

				randomString.split('').forEach(function (char) {
					char.should.be.oneOf(lettersArray);
				});
			});
		});

		it('should return characters from a Range()', function () {
			let options = {
				letters: new Range('A-G')
			};

			let lettersArray = 'ABCDEFG'.split('');
			let stringGenerator = generators.string(options, '5-10');

			repeat(20, function () {
				let randomString = stringGenerator.next().value;
				randomString.length.should.be.within(5, 10);

				randomString.split('').forEach(function (char) {
					char.should.be.oneOf(lettersArray);
				});
			});
		});

		it('should have a default length', function () {
			let options = { letters: 'ABCDEFG' };
			let stringGenerator = generators.string(options);

			repeat(20, function () {
				let randomString = stringGenerator.next().value;
				randomString.length.should.be.within(10, 20);
			});
		});

		it('should support converting other generators into strings', function () {
			let stringNumberGenerator = generators.string({}, 'int:0-10');

			repeat(20, function () {
				let randomStringNumber = stringNumberGenerator.next().value;
				randomStringNumber.should.be.type('string');

				let randomNumber = Number(randomStringNumber);
				randomNumber.should.be.within(0, 10);
				(randomNumber % 1).should.equal(0);
			});
		});

		it('should support converting async generators into strings', function (done) {
			let generator = generators.string({}, 'async:2');
			let generated = generator.next().value;

			let time = Date.now();
			generated.then(function (two) {
				(Date.now() - time).should.be.within(20, 30);
				two.should.equal('2');
				done();
			});
		});
	});

	describe('number', function () {
		it('should return a number', function () {
			let numberGenerator = generators.number({}, '5-10');
			repeat(20, function () {
				let randomNumber = numberGenerator.next().value;
				randomNumber.should.be.a.Number();
				randomNumber.should.be.within(5, 10);
			});
		});

		it('should support decimals', function () {
			let numberGenerator = generators.number({}, '0.1-0.9');
			repeat(20, function () {
				let randomNumber = numberGenerator.next().value;
				randomNumber.should.be.a.Number();
				randomNumber.should.be.within(0.1, 0.9);
			});
		});

		it('should support negative numbers', function () {
			let numberGenerator = generators.number({}, '-20--10');
			repeat(20, function () {
				let randomNumber = numberGenerator.next().value;
				randomNumber.should.be.a.Number();
				randomNumber.should.be.within(-20, -10);
			});
		});

		// This _can_ fail, but is statistically unlikely to
		it('should return a number of a given < 1 precision', function () {
			let numberGenerator = generators.number({}, '5-10', '0.0001');
			repeat(10, function () {
				let randomNumber = numberGenerator.next().value;
				randomNumber.should.be.a.Number();
				randomNumber.should.be.within(5, 10);

				let strNumber = randomNumber.toString();
				(strNumber.indexOf('.') - strNumber.length).should.equal(-5);
			}, { allowFailures: 3 });
		});

		it('should return a number of a given > 1 precision', function () {
			let numberGenerator = generators.number({}, '10225-10245', '100');
			let randomNumber = numberGenerator.next().value;
			randomNumber.should.equal(10200);
		});

		it('should have a default range', function () {
			let numberGenerator = generators.number({});
			repeat(20, function () {
				let randomNumber = numberGenerator.next().value;
				randomNumber.should.be.a.Number();
				randomNumber.should.be.within(0, 1);
			});
		});
	});

	describe('int', function () {
		it('should return an integer', function () {
			let intGenerator = generators.int({}, '7-10');
			repeat(20, function () {
				let randomNumber = intGenerator.next().value;
				randomNumber.should.be.a.Number();
				randomNumber.should.be.oneOf([7, 8, 9, 10]);
			});
		});

		it('should support negative numbers', function () {
			let intGenerator = generators.int({}, '-10--7');
			repeat(20, function () {
				let randomNumber = intGenerator.next().value;
				randomNumber.should.be.a.Number();
				randomNumber.should.be.oneOf([-10, -9, -8, -7]);
			});
		});

		it('should have a default range', function () {
			let intGenerator = generators.int({});
			repeat(20, function () {
				let randomNumber = intGenerator.next().value;
				randomNumber.should.be.a.Number();
				randomNumber.should.be.within(0, 10);
			});
		});
	});

	describe('char', function () {
		it('should return a char', function () {
			let charGenerator = generators.char({}, 'F-I');
			repeat(20, function () {
				let randomChar = charGenerator.next().value;
				randomChar.should.be.a.String();
				randomChar.length.should.equal(1);
				randomChar.should.be.oneOf(['F', 'G', 'H', 'I']);
			});
		});

		it('should have a default range', function () {
			let charGenerator = generators.char({});
			repeat(20, function () {
				let randomChar = charGenerator.next().value;
				randomChar.should.be.a.String();
				randomChar.length.should.equal(1);
				randomChar.should.match(/[A-Z]/);
			});
		});
	});

	describe('boolean', function () {
		it('should return a boolean value', function () {
			let booleanGenerator = generators.boolean({});
			repeat(20, function () {
				let randomBoolean = booleanGenerator.next().value;
				randomBoolean.should.be.type('boolean');
			});
		});

		it('should return a biased boolean value', function () {
			generators.boolean({}, 1).next().value.should.be.True();
		});
	});

	describe('oneOf', function () {
		it('should pick a random generator', function () {
			let oneOfGenerator = generators.oneOf({}, 'int:4-4', 'int:7-7');
			repeat(20, function () {
				let randomGenerator = oneOfGenerator.next().value;
				randomGenerator.should.be.oneOf([4, 7]);
			});
		});
	});

	describe('array', function () {
		it('should make an array of generators', function (done) {
			let arrayGenerator = generators.array({}, 'int:4-5', 'number:7-8');

			let remaining = 20;

			repeat(remaining, function () {
				let promise = arrayGenerator.next().value;
				promise.should.be.instanceof(Promise);

				promise.then(function (vals) {
					vals[0].should.be.oneOf([4, 5]);
					vals[1].should.be.within(7, 8);

					if (--remaining === 0) {
						done();
					}
				});
			});
		});

		it('should work with async values', function (done) {
			let arrayGenerator = generators.array({}, 'async', 'int:4-5', 'async:foobar');

			let remaining = 3;
			let time = Date.now();

			repeat(remaining, function () {
				let promise = arrayGenerator.next().value;

				promise.then(function (vals) {
					vals.length.should.equal(3);
					vals[0].should.equal('test');
					vals[1].should.be.oneOf([4, 5]);
					vals[2].should.equal('foobar');
					(Date.now() - time).should.be.within(20, 30);

					if (--remaining === 0) {
						done();
					}
				});
			});
		});
	});

	describe('repeat', function () {
		it('should repeat a generator n times', function () {
			let nStrings = generators.repeat({}, 3, 'int:3-3');
			return nStrings.next().value.then(function (val) {
				val.should.equal('333');
			});
		});

		it('should work with async generators', function (done) {
			let generator = generators.repeat({}, 3, 'async:buzz');

			let remaining = 3;
			let time = Date.now();

			repeat(remaining, function () {
				let promise = generator.next().value;

				promise.then(function (vals) {
					vals.should.equal('buzzbuzzbuzz');
					(Date.now() - time).should.be.within(20, 30);

					if (--remaining === 0) {
						done();
					}
				});
			});
		});

		it('should not return the same thing each time', function () {
			let generator = generators.repeat({}, 10, 'int:0-9');
			return generator.next().value.then(function (value) {
				// The chances of this happening randomly are 1 in 10^9
				value.split(value[0]).length.should.not.equal(11);
			});
		});
	});

	describe('literal', function () {
		it('should return literal string values', function () {
			let string = generators.literal({}, '"test"').next().value;
			string.should.equal('test');
		});

		it('should work with more complex values', function () {
			let object = {
				foo: 'bar',
				ary: [1, 2, 3]
			};

			let generatedObject = generators.literal({}, JSON.stringify(object));
			generatedObject.next().value.should.deepEqual(object);
		});
	});

	describe('entry', function () {
		it('should get a random entry of an array', function () {
			let collection = [4, 7, 10, 15];

			let entryGenerator = generators.entry({ collection });

			repeat(20, function () {
				let entry = entryGenerator.next().value;
				entry.should.be.oneOf(collection);
			});
		});

		it('should support alternative properties', function () {
			let ary = [4, 7, 10, 15];

			let entryGenerator = generators.entry({ ary }, 'ary');

			repeat(20, function () {
				let entry = entryGenerator.next().value;
				entry.should.be.oneOf(ary);
			});
		});

		it('should get random entry of an object', function () {
			let collection = {
				foo: 'bar',
				hello: 'world'
			};

			let entryGenerator = generators.entry({ collection });

			repeat(20, function () {
				let entry = entryGenerator.next().value;
				entry.should.be.oneOf(['bar', 'world']);
			});
		});
	});
});

function repeat(n, cb, opts) {
	if (!opts) {
		opts = {};
	}

	if (typeof opts.allowFailures !== 'number') {
		opts.allowFailures = 0;
	}

	let failures = 0;

	for (let i = 0; i < n; i++) {
		try {
			cb();
		} catch (e) {
			failures++;

			if (failures > opts.allowFailures) {
				throw e;
			}

			console.log('Error suppressed by repeat handler.');
		}
	}
}

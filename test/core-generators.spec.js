import Range from '../src/range';
import * as generators from '../src/core-generators';

describe('Core generators', function () {
	describe('string', function () {
		it('should return a string of random length', function () {
			let options = {
				letters: 'ABCDEFG'
			};

			let lettersArray = options.letters.split('');

			repeat(20, function () {
				let randomString = generators.string(options, '5-10');
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

			repeat(20, function () {
				let randomString = generators.string(options, '5-10');
				randomString.length.should.be.within(5, 10);

				randomString.split('').forEach(function (char) {
					char.should.be.oneOf(lettersArray);
				});
			});
		});

		it('should have a default length', function () {
			let options = { letters: 'ABCDEFG' };

			repeat(20, function () {
				let randomString = generators.string(options);
				randomString.length.should.be.within(10, 20);
			});
		});
	});

	describe('number', function () {
		it('should return a number', function () {
			repeat(20, function () {
				let randomNumber = generators.number({}, '5-10');
				randomNumber.should.be.a.Number();
				randomNumber.should.be.within(5, 10);
			});
		});

		it('should support decimals', function () {
			repeat(20, function () {
				let randomNumber = generators.number({}, '0.1-0.9');
				randomNumber.should.be.a.Number();
				randomNumber.should.be.within(0.1, 0.9);
			});
		});

		it('should support negative numbers', function () {
			repeat(20, function () {
				let randomNumber = generators.number({}, '-20--10');
				randomNumber.should.be.a.Number();
				randomNumber.should.be.within(-20, -10);
			});
		});

		// This _can_ fail, but is statistically unlikely to
		it('should return a number of a given < 1 precision', function () {
			repeat(10, function () {
				let randomNumber = generators.number({}, '5-10', '0.0001');
				randomNumber.should.be.a.Number();
				randomNumber.should.be.within(5, 10);

				let strNumber = randomNumber.toString();
				(strNumber.indexOf('.') - strNumber.length).should.be.within(-5, -3);
			});
		});

		it('should return a number of a given > 1 precision', function () {
			let randomNumber = generators.number({}, '10225-10245', '100');
			randomNumber.should.equal(10200);
		});

		it('should have a default range', function () {
			repeat(20, function () {
				let randomNumber = generators.number({});
				randomNumber.should.be.a.Number();
				randomNumber.should.be.within(0, 1);
			});
		});
	});

	describe('int', function () {
		it('should return an integer', function () {
			repeat(20, function () {
				let randomNumber = generators.int({}, '7-10');
				randomNumber.should.be.a.Number();
				randomNumber.should.be.oneOf([7, 8, 9, 10]);
			});
		});

		it('should support negative numbers', function () {
			repeat(20, function () {
				let randomNumber = generators.int({}, '-10--7');
				randomNumber.should.be.a.Number();
				randomNumber.should.be.oneOf([-10, -9, -8, -7]);
			});
		});

		it('should have a default range', function () {
			repeat(20, function () {
				let randomNumber = generators.int({});
				randomNumber.should.be.a.Number();
				randomNumber.should.be.within(0, 10);
			});
		});
	});

	describe('char', function () {
		it('should return a char', function () {
			repeat(20, function () {
				let randomChar = generators.char({}, 'F-I');
				randomChar.should.be.a.String();
				randomChar.length.should.equal(1);
				randomChar.should.be.oneOf(['F', 'G', 'H', 'I']);
			});
		});

		it('should have a default range', function () {
			repeat(20, function () {
				let randomChar = generators.char({});
				randomChar.should.be.a.String();
				randomChar.length.should.equal(1);
				randomChar.should.match(/[A-Z]/);
			});
		});
	});

	describe('boolean', function () {
		it('should return a boolean value', function () {
			repeat(20, function () {
				let randomBoolean = generators.boolean({});
				randomBoolean.should.be.type('boolean');
			});
		});

		it('should return a biased boolean value', function () {
			generators.boolean({}, 1).should.be.True();
		});
	});

	describe('array', function () {
		it('should pick a random generator', function () {
			repeat(20, function () {
				let randomGenerator = generators.array({}, 'int:4-4', 'int:7-7');
				randomGenerator.should.be.oneOf([4, 7]);
			});
		});
	});

	describe('repeat', function () {
		it('should repeat a generator n times', function () {
			let nStrings = generators.repeat({}, 3, 'int:3-3');
			nStrings.should.equal('333');
		});
	});

	describe('literal', function () {
		it('should return literal string values', function () {
			let string = generators.literal({}, '"test"');
			string.should.equal('test');
		});

		it('should work with more complex values', function () {
			let object = {
				foo: 'bar',
				ary: [1, 2, 3]
			};

			let generatedObject = generators.literal({}, JSON.stringify(object));
			generatedObject.should.deepEqual(object);
		});
	});
});

// @todo: Add an option to allow a small percentage of failures
function repeat(n, cb) {
	for (let i = 0; i < n; i++) {
		cb();
	}
}
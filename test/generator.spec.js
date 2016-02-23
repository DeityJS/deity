import regeneratorRuntime from 'regenerator/runtime-module'; // eslint-disable-line

import deity from '../src/index';
import Generator from '../src/generator';

describe('Generator function', function () {
	describe('Parsing', function () {
		it('should handle simple types', function () {
			let generator = new Generator('string', deity.defaultOptions);
			generator._type.should.equal('string');
			generator._args.should.deepEqual([]);
		});

		it('should handle types with single arguments', function () {
			let generator = new Generator('char:A-F', deity.defaultOptions);
			generator._type.should.equal('char');
			generator._args.should.deepEqual(['A-F']);
		});

		it('should handle types with multiple arguments', function () {
			let generator = new Generator('oneOf:(number):(char)', deity.defaultOptions);
			generator._type.should.equal('oneOf');
			generator._args.should.deepEqual(['number', 'char']);
		});

		it('should handle types with generator arguments', function () {
			let generator = new Generator('oneOf:(char:F-L)', deity.defaultOptions);
			generator._type.should.equal('oneOf');
			generator._args.should.deepEqual(['char:F-L']);
		});

		it('should handle types with multiple generator arguments', function () {
			let generator = new Generator('array:(char:S-Z):(number:0-10)', deity.defaultOptions);
			generator._type.should.equal('array');
			generator._args.should.deepEqual(['char:S-Z', 'number:0-10']);
		});

		it('should have a useful error when generator not found', function () {
			(function () {
				new Generator('foobar'); // eslint-disable-line no-new
			}).should.throw(/Generator "foobar" not found/);
		});
	});

	describe('Special cases', function () {
		it('should handle multipliers', function () {
			let generator = new Generator('3*(number)');
			generator._type.should.equal('repeat');
			generator._args.should.deepEqual(['3', 'number']);
		});

		it('should handle number ranges', function () {
			let generator = new Generator('10-2000');
			generator._type.should.equal('number');
			generator._args.should.deepEqual(['10-2000']);
		});

		it('should handle number ranges with decimals', function () {
			let generator = new Generator('0.1-0.9');
			generator._type.should.equal('number');
			generator._args.should.deepEqual(['0.1-0.9']);
		});

		it('should handle number ranges with negatives', function () {
			let generator = new Generator('-50--30');
			generator._type.should.equal('number');
			generator._args.should.deepEqual(['-50--30']);
		});

		it('should handle character ranges', function () {
			let generator = new Generator('F-M');
			generator._type.should.equal('char');
			generator._args.should.deepEqual(['F-M']);
		});

		it('should handle literal strings', function () {
			let generator = new Generator('"test"');
			generator._type.should.equal('literal');
			generator._args.should.deepEqual(['"test"']);

			generator.resolve().should.equal('test');
		});
	});

	describe('Resolving', function () {
		it('should have a resolve function', function () {
			let generator = new Generator('number:1-5');
			generator.resolve.should.be.a.Function();
		});

		it('should return a value', function () {
			let generator = new Generator('number:1-5');
			generator.resolve().should.be.a.Number();
			generator.resolve().should.be.within(1, 5);
		});
	});

	describe('asynchronous generators', function () {
		before(function () {
			deity.extend('async', function* () {
				let promise = new Promise(function (resolve) {
					setTimeout(resolve, 20);
				});

				while (true) {
					yield promise.then(function () {
						return 'test';
					});
				}
			});
		});

		it('should have async properties', function () {
			let generator = new Generator('async');
			generator._type.should.equal('async');
			generator.async.should.be.True();
		});

		it('should not have async if not async though', function () {
			let generator = new Generator('number');
			generator._type.should.equal('number');
			generator.async.should.be.False();
		});

		it('should not waste generator results', function () {
			let count = 0;

			deity.extend('async-counted', function* () {
				let promise = new Promise(function (resolve) {
					setTimeout(resolve, 2);
				});

				while (true) {
					count++;
					yield promise.then(function () {
						return 'test';
					});
				}
			});

			let generator = new Generator('async-counted');
			generator.resolve();

			count.should.equal(1);
		});

		it('should resolve', function (done) {
			let generator = new Generator('async');
			let time = Date.now();

			generator.resolve(function () {
				(Date.now() - time).should.be.within(20, 30);
				done();
			});
		});
	});
});

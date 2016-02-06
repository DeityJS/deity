import regeneratorRuntime from 'regenerator/runtime-module'; // eslint-disable-line

import deity from '../src/index';
import Generator from '../src/generator';

describe('Generator function', function () {
	describe('Parsing', function () {
		it('should handle simple types', function () {
			let generator = new Generator('string');
			generator._type.should.equal('string');
			generator._args.should.deepEqual([]);
		});

		it('should handle types with single arguments', function () {
			let generator = new Generator('string:test');
			generator._type.should.equal('string');
			generator._args.should.deepEqual(['test']);
		});

		it('should handle types with multiple arguments', function () {
			let generator = new Generator('string:test:two');
			generator._type.should.equal('string');
			generator._args.should.deepEqual(['test', 'two']);
		});

		it('should handle types with generator arguments', function () {
			let generator = new Generator('string:(test:test)');
			generator._type.should.equal('string');
			generator._args.should.deepEqual(['test:test']);
		});

		it('should handle types with multiple generator arguments', function () {
			let generator = new Generator('string:(a:b):(test:test)');
			generator._type.should.equal('string');
			generator._args.should.deepEqual(['a:b', 'test:test']);
		});

		it('should have a useful error when generator not found', function () {
			(function () {
				new Generator('foobar'); // eslint-disable-line no-new
			}).should.throw(/Generator "foobar" not found/);
		});
	});

	describe('Special cases', function () {
		it('should handle multipliers', function () {
			let generator = new Generator('3*(test)');
			generator._type.should.equal('repeat');
			generator._args.should.deepEqual(['3', 'test']);
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

		it('should have a resolve function', function () {
			let generator = new Generator('number:1-5');
			generator.resolve.should.be.a.Function();
		});

		it('should return a value', function () {
			let generator = new Generator('number:1-5');
			generator.resolve().should.be.a.Number();
			generator.resolve().should.be.within(1, 5);
		});

		it('should support asyncronous generators', function (done) {
			let generator = new Generator('async');
			let time = Date.now();

			generator.resolve(function () {
				(Date.now() - time).should.be.within(20, 30);
				done();
			});
		});
	});
});

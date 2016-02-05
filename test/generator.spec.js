import Generator from '../src/generator';

describe('Generator function', function () {
	describe('Parsing', function () {
		it('should handle simple types', function () {
			let generator = new Generator('foobar');
			generator._type.should.equal('foobar');
			generator._args.should.deepEqual([]);
		});

		it('should handle types with single arguments', function () {
			let generator = new Generator('foobar:test');
			generator._type.should.equal('foobar');
			generator._args.should.deepEqual(['test']);
		});

		it('should handle types with multiple arguments', function () {
			let generator = new Generator('foobar:test:two');
			generator._type.should.equal('foobar');
			generator._args.should.deepEqual(['test', 'two']);
		});

		it('should handle types with generator arguments', function () {
			let generator = new Generator('foobar:(test:test)');
			generator._type.should.equal('foobar');
			generator._args.should.deepEqual(['test:test']);
		});

		it('should handle types with multiple generator arguments', function () {
			let generator = new Generator('foobar:(a:b):(test:test)');
			generator._type.should.equal('foobar');
			generator._args.should.deepEqual(['a:b', 'test:test']);
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

		it('should handle character ranges', function () {
			let generator = new Generator('F-M');
			generator._type.should.equal('char');
			generator._args.should.deepEqual(['F-M']);
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
});
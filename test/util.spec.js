import * as util from '../src/util';
import Range from '../src/range';

describe('Utility functions', function () {
	describe('isNumeric()', function () {
		it('should return true for numbers', function () {
			util.isNumeric(4).should.be.True();
			util.isNumeric(444.44).should.be.True();
		});

		it('should return true for number-like strings', function () {
			util.isNumeric('14').should.be.True();
			util.isNumeric('1459.24').should.be.True();
		});

		it('should return true for negative numbers', function () {
			util.isNumeric('-10').should.be.True();
			util.isNumeric('-10.5').should.be.True();
		});

		it('should return false for non-number-like strings', function () {
			util.isNumeric('horse').should.be.False();
			util.isNumeric('14 cars').should.be.False();
		});

		it('should return false for random values', function () {
			util.isNumeric([]).should.be.False();
			util.isNumeric({}).should.be.False();
			util.isNumeric([1]).should.be.False();
		});
	});

	describe('getRandomElementOf()', function () {
		it('should get characters from strings', function () {
			util.getRandomElementOf('A').should.equal('A');
			util.getRandomElementOf('ABC').should.be.oneOf(['A', 'B', 'C']);
		});

		it('should get elements of arrays', function () {
			util.getRandomElementOf([1]).should.equal(1);
			util.getRandomElementOf([1, 2, 3]).should.be.oneOf([1, 2, 3]);
		});

		it('should get randoms from ranges', function () {
			util.getRandomElementOf(new Range('2-2')).should.equal(2);
			util.getRandomElementOf(new Range('2-4')).should.be.within(2, 4);
		});

		it('should get values from objects', function () {
			let obj = { one: 'two', three: 'four' };
			util.getRandomElementOf(obj).should.be.oneOf(['two', 'four']);
		});
	});
});

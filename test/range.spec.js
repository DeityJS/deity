import Range from '../src/range';

describe('Range function', function () {
	describe('new Range()', function () {
		it('should work with numbers', function () {
			let numberRange = new Range('5-10');
			numberRange.should.be.instanceof(Range);
			numberRange.type.should.equal('number');
			numberRange.min.should.equal(5);
			numberRange.max.should.equal(10);
		});

		it('should work with negative numbers', function () {
			let negativeRange = new Range('-20--10');
			negativeRange.should.be.instanceof(Range);
			negativeRange.type.should.equal('number');
			negativeRange.min.should.equal(-20);
			negativeRange.max.should.equal(-10);
		});

		it('should work with characters', function () {
			let charRange = new Range('F-X');
			charRange.should.be.instanceof(Range);
			charRange.type.should.equal('char');
			charRange.min.should.equal('F');
			charRange.max.should.equal('X');
		});
	});

	describe('isInRange()', function () {
		it('should return true when number in range', function () {
			let numberRange = new Range('10-15');
			numberRange.isInRange(10).should.be.True();
			numberRange.isInRange(15).should.be.True();
			numberRange.isInRange(12).should.be.True();
			numberRange.isInRange(12.5).should.be.True();
		});

		it('should return false when number not in range', function () {
			let numberRange = new Range('10-15');
			numberRange.isInRange(9).should.be.False();
			numberRange.isInRange(16).should.be.False();
			numberRange.isInRange(-10).should.be.False();
		});

		it('should return true when char in range', function () {
			let charRange = new Range('L-R');
			charRange.isInRange('L').should.be.True();
			charRange.isInRange('R').should.be.True();
			charRange.isInRange('N').should.be.True();
		});

		it('should return false when char not in range', function () {
			let charRange = new Range('L-R');
			charRange.isInRange('F').should.be.False();
			charRange.isInRange('K').should.be.False();
			charRange.isInRange('S').should.be.False();
		});
	});

	describe('getRandom()', function () {
		it('should return random entry from string', function () {
			new Range('L-L').getRandom().should.equal('L');
			new Range('A-C').getRandom().should.be.oneOf(['A', 'B', 'C']);
		});

		it('should return random entry from number range', function () {
			new Range('10-10').getRandom().should.equal(10);
			new Range('5-7').getRandom().should.be.within(5, 7);
		});
	});

	describe('getRandomInt()', function () {
		it('should return random entry from number range', function () {
			new Range('10-10').getRandomInt().should.equal(10);
			new Range('5-7').getRandomInt().should.be.within(5, 7);

			let rand = new Range('0-100').getRandomInt();

			(rand % 1).should.equal(0);
		});
	});
});
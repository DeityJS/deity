import deity from '../src/index';

describe('Deity', function () {
	it('should call a generator x times', function () {
		let timesCalled = 0;

		deity('number:1-5', { iterations: 50 }, function () {
			timesCalled++;
		});

		timesCalled.should.equal(50);
	});

	// This test _can_ fail, but is statistically unlikely to
	it('should probably return a different value every time', function () {
		let lastValue = 0;

		deity('number:1-100', function (newValue) {
			newValue.should.not.equal(lastValue);
			lastValue = newValue;
		});
	});
});
import regeneratorRuntime from 'regenerator/runtime-module';
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

	describe('plugins', function () {
		it('should have the ability to add a function from the function name', function () {
			function* plugin1() {
				while (true) {
					yield 'one';
				}
			}

			deity.extend(plugin1);

			let calls = 0;
			deity('plugin1', { iterations: 3 }, function (one) {
				one.should.equal('one');
				calls++;
			});

			calls.should.equal(3);
		});

		it('should have the ability to add single plugins', function () {
			deity.extend('plugin2', function* () {
				while (true) {
					yield 'two';
				}
			});

			let calls = 0;
			deity('plugin2', { iterations: 3 }, function (two) {
				two.should.equal('two');
				calls++;
			});

			calls.should.equal(3);
		});

		it('should have the ability to add a number of plugins from an object', function () {
			deity.extend({
				plugin3: function* () {
					while (true) {
						yield 'three';
					}
				},
				plugin4: function* () {
					while (true) {
						yield 'four';
					}
				}
			});

			let calls = 0;
			deity('plugin3', { iterations: 3 }, function (three) {
				three.should.equal('three');
				calls++;
			});

			calls.should.equal(3);

			deity('plugin4', { iterations: 2 }, function (four) {
				four.should.equal('four');
				calls++;
			});

			calls.should.equal(5);
		});
	});
});
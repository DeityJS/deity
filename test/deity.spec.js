import regeneratorRuntime from 'regenerator/runtime-module'; // eslint-disable-line
import deityModule from '../src/index';
import bundle from '../dist/deity.min';

runTests('Built Deity', bundle);
runTests('Deity', deityModule);

function runTests(name, deity) {
	describe(name, function () {
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

		// This will fail if the promise stuff fails, but that's tested
		it('should support async generators', function () {
			let time = Date.now();

			return deity('async:callum', { iterations: 50 }, function (val) {
				val.should.equal('callum');
				(Date.now() - time).should.be.within(20, 60);
			});
		});

		it('should return a promise that resolves when everything is done', function (done) {
			let promise = deity('async', { iterations: 3 }, function () {});
			promise.should.be.instanceof(Promise);

			let time = Date.now();

			promise.then(function () {
				let difference = Date.now() - time;
				if (difference < 20 || difference > 80) {
					done(new Error('Different was too great: ' + difference));
				} else {
					done();
				}
			});
		});

		it('should throw errors', function () {
			(function () {
				deity('number', { iterations: 1 }, function () {
					throw new Error('test error');
				});
			}).should.throw(/test error/);
		});

		it('should allow you to return promises from generators', function () {
			let wins = 0;

			let promise = deity('number:1-5', { iterations: 5 }, function () {
				return new Promise(function (resolve) {
					setTimeout(function () {
						wins++;
						resolve();
					}, 10);
				});
			});

			return promise.then(function () {
				wins.should.equal(5);
			});
		});

		it('should allow you to return failing promises from generators', function (done) {
			this.timeout(4000);

			let losses = 0;

			let promise = deity('number:1-5', { iterations: 5 }, function () {
				return new Promise(function (resolve, reject) {
					setTimeout(function () {
						losses++;
						reject();
					}, 10);
				});
			});

			promise.then(function () {
				done(new Error('Should have failed'));
			}, function () {
				losses.should.equal(5);
				done();
			});
		});

		it('should throw errors from async generators', function (done) {
			let promise = deity('async', { iterations: 2 }, function () {
				throw new Error('testing testing');
			});

			promise.then(function () {
				done(new Error('Expected error to be throw but promise succeeded :/'));
			});

			promise.catch(function (e) {
				e.message.should.equal('testing testing');
				done();
			});
		});

		describe('Invalid arguments', function () {
			it('should throw error when no generators specified', function () {
				(function () {
					deity(function () {});
				}).should.throw(/NO_GENERATOR/);
			});

			it('should throw error when no callback specified', function () {
				(function () {
					deity('number');
				}).should.throw(/NO_CALLBACK/);
			});
		});

		describe('multiple generators', function () {
			it('should support multiple generators', function () {
				let timesCalled = 0;

				return deity('number:1-5', 'number:10-15', { iterations: 50 }, function (a, b) {
					a.should.be.within(1, 5);
					b.should.be.within(10, 15);
					timesCalled++;
				})
						.then(function () {
							timesCalled.should.equal(50);
						});
			});

			it('should support multiple async generators', function () {
				let timesCalled = 0;

				return deity('async:test', 'async:hello', { iterations: 10 }, function (a, b) {
					a.should.equal('test');
					b.should.equal('hello');
					timesCalled++;
				})
						.then(function () {
							timesCalled.should.equal(10);
						});
			});

			it('should support async + non-async generators combined', function () {
				let timesCalled = 0;

				return deity('async:test', 'number:10-15', { iterations: 10 }, function (a, b) {
					a.should.equal('test');
					b.should.be.within(10, 15);
					timesCalled++;
				})
						.then(function () {
							timesCalled.should.equal(10);
						});
			});

			it('should work with looaads of generators', function () {
				let generators = [];

				for (let i = 0; i < 50; i++) {
					generators.push('number');
				}

				return deity(...generators, { iterations: 10 }, function (...numbers) {
					numbers.length.should.equal(50);
					numbers[0].should.not.equal(numbers[1]);

					numbers.forEach(function (number) {
						number.should.be.a.Number();
						number.should.be.within(0, 1);
					});
				});
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
				return deity('plugin1', { iterations: 3 }, function (one) {
					one.should.equal('one');
					calls++;
				})
						.then(function () {
							calls.should.equal(3);
						});
			});

			it('should have the ability to add single plugins', function () {
				deity.extend('plugin2', function* () {
					while (true) {
						yield 'two';
					}
				});

				let calls = 0;
				return deity('plugin2', { iterations: 3 }, function (two) {
					two.should.equal('two');
					calls++;
				})
						.then(function () {
							calls.should.equal(3);
						});
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
				return deity('plugin3', { iterations: 3 }, function (three) {
					three.should.equal('three');
					calls++;
				})
						.then(function () {
							calls.should.equal(3);

							return deity('plugin4', { iterations: 2 }, function (four) {
								four.should.equal('four');
								calls++;
							})
									.then(function () {
										calls.should.equal(5);
									});
						});
			});
		});
	});
}

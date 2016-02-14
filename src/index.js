'use strict';

import Range from './range';
import Generator from './generator';
import generators from './core-generators';

import objectAssign from 'object-assign';

/**
 * Takes a given generator and calls a function a number of times with some
 * random strings or something.
 *
 * @param {...string} generatorStrings Strings to create generators from.
 * @param {object} [opts] Optional options, such as number of iterations.
 * @param {function} fn The function to call.
 * @returns {Promise} A promise that resolves when all callbacks are called.
 */
export default function deity(...args) {
	let generatorStrings = [];
	let opts = objectAssign({}, deity.defaultOptions);
	let fn, promiseFn;

	args.forEach(function (arg) {
		if (typeof arg === 'string') {
			generatorStrings.push(arg);
		} else if (typeof arg === 'object') {
			objectAssign(opts, arg);
		} else if (typeof arg === 'function') {
			fn = arg;
		}
	});

	let generators = generatorStrings.map(function (generatorString) {
		return new Generator(generatorString, opts);
	});

	if (generators.length > 1) {
		promiseFn = function (resolve, reject) {
			let generatorPromises = generators.map(function (generator) {
				return new Promise((resolve) => generator.resolve(resolve));
			});

			Promise.all(generatorPromises)
				.then(function (values) {
					try {
						let fnResult = fn(...values);

						if (fnResult && typeof fnResult.then === 'function') {
							fnResult.then(resolve, reject);
						} else {
							resolve(fnResult);
						}
					} catch (e) {
						reject(e);
					}
				});
		};
	} else {
		promiseFn = function (resolve, reject) {
			generators[0].resolve(function (val) {
				try {
					let fnResult = fn(val);

					if (fnResult && typeof fnResult.then === 'function') {
						fnResult.then(resolve, reject);
					} else {
						resolve(fnResult);
					}
				} catch (e) {
					reject(e);
				}
			});
		};
	}

	let promiseArray = [];
	for (let i = 0; i < opts.iterations; i++) {
		promiseArray.push(new Promise(promiseFn));
	}

	return Promise.all(promiseArray);
}

/**
 * Add a new generator or generators. Accepts either a single named a function,
 * a name and a function, or an object containing keys as names and functions.
 *
 * @param {string|object} [key] The name of the generator, or an object of
 *                              multiple generators.
 * @param {function} fn A generator function. If named, key is optional.
 */
deity.extend = function (key, fn) {
	if (typeof key === 'function' && key.name) {
		generators[key.name] = key;
	} else if (typeof key === 'object') {
		for (let pluginName of Object.keys(key)) {
			generators[pluginName] = key[pluginName];
		}
	} else {
		generators[key] = fn;
	}
};

// Default configuration, merged with opts in the deity function.
deity.defaultOptions = {
	iterations: 100,
	//letters: '1234567890ABCdefghjKLMNOpQRs',
	letters: new Range('A-Z')
};

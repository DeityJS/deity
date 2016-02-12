'use strict';

import Range from './range';
import Generator from './generator';
import generators from './core-generators';

import objectAssign from 'object-assign';

/**
 * Takes a given generator and calls a function a number of times with some
 * random strings or something.
 *
 * @param {string} generatorString String to create a generator from.
 * @param {object} [opts] Optional options, such as number of iterations.
 * @param {function} fn The function to call.
 * @returns {Promise} A promise that resolves when all callbacks are called.
 */
export default function deity(generatorString, opts, fn) {
	if (typeof opts === 'function') {
		fn = opts;
		opts = {};
	}

	opts = objectAssign({}, deity.defaultOptions, opts);

	let generator = new Generator(generatorString, opts);
	let promiseArray = [];

	let promiseFn = function (resolve, reject) {
		generator.resolve(function (val) {
			try {
				let fnResult = fn(val);
				Promise.resolve(fnResult).then(resolve, reject);
			} catch (e) {
				reject(e);
			}
		});
	};

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

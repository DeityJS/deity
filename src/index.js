'use strict';

import Range from './range';
import Generator from './generator';
import generators from './core-generators';

import { objectAssign } from './util';

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
	let fn;

	args.forEach(function (arg) {
		if (typeof arg === 'string') {
			generatorStrings.push(arg);
		} else if (typeof arg === 'object') {
			objectAssign(opts, arg);
		} else if (typeof arg === 'function') {
			fn = arg;
		}
	});

	if (generatorStrings.length === 0) {
		throw new TypeError('NO_GENERATOR: You must specify at least one generator for Deity');
	}

	if (typeof fn !== 'function') {
		throw new TypeError('NO_CALLBACK: You must specify a callback function for Deity');
	}

	let generators = generatorStrings.map(function (generatorString) {
		return new Generator(generatorString, opts);
	});

	let allSync = generators.every((generator) => !generator.async);

	// Case one: all specified generators are synchronous. We don't need to mess
	// about with promises. This is simple.
	if (allSync) {
		let returnPromises = [];

		for (let i = 0; i < opts.iterations; i++) {
			let vals = generators.map((generator) => generator.resolve());
			// We allow any thrown errors to be thrown
			var returnValue = fn(...vals);

			if (returnValue && typeof returnValue.then === 'function') {
				returnPromises.push(returnValue);
			}
		}

		return returnPromises.length ? Promise.all(returnPromises) : Promise.resolve();
	}

	// Case two: one or more generators are asynchronous. We use promises to
	// make sure that nothing is called early and to handle errors.

	let promiseArray = [];

	// Some functions for inside the loop
	let callSpreadValues = (values) => fn(...values);
	let generatorToPromise = function (generator) {
		return new Promise((resolve) => generator.resolve(resolve));
	};

	for (let i = 0; i < opts.iterations; i++) {
		// We can't call the callback until _all_ the generators have returned
		let finalPromise = Promise.all(generators.map(generatorToPromise))
			.then(callSpreadValues);

		promiseArray.push(finalPromise);
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

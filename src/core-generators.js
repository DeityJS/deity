import regeneratorRuntime from 'regenerator/runtime-module'; // eslint-disable-line

import Range from './range';
import Generator from './generator';
import { getRandomElementOf, isNumeric, getYieldValue } from './util';

const generators = {};
export default generators;

/**
 * Returns a string of random length, or calls another generator and converts
 * the results into a string.
 *
 * @param {object} options Configuration.
 * @param {string} range Either a range determining the length of the generated
 *                       string, or a string to generator another generator.
 */
generators.string = function*(options, range = '10-20') {
	if (/^\d+-\d+$/.test(range)) {
		range = new Range(range);

		while (true) {
			let length = range.getRandomInt();
			let str = '';

			for (let i = 0; i < length; i++) {
				str += getRandomElementOf(options.letters);
			}

			yield str;
		}
	} else {
		let generator = new Generator(range);
		let toString = (val) => val.toString();

		while (true) {
			let resolved = generator.resolve();
			yield getYieldValue(resolved, toString);
		}
	}
};

/**
 * Returns a number between in a given range of numbers, of a given precision.
 *
 * @param {object} options Configuration.
 * @param {string} range A range to generate numbers from.
 * @param {number} precision A precision to round the generated number to.
 */
generators.number = function*(options, range = '0-1', precision) {
	range = new Range(range);

	if (!isNumeric(precision)) {
		while (true) {
			yield range.getRandom();
		}
	} else {
		while (true) {
			let random = range.getRandom();

			if (precision < 1) {
				yield Number(random.toFixed(-Math.log10(precision)));
			} else {
				yield Math.round(random / precision) * precision;
			}
		}
	}
};

/**
 * Returns an integer in a given range of numbers.
 * @param {object} options Configuration.
 * @param {string} range A range to generate integers from.
 */
generators.int = function*(options, range = '0-10') {
	range = new Range(range);

	while (true) {
		yield range.getRandomInt();
	}
};

/**
 * Returns a character in a given range of characters.
 *
 * @param {object} options Configuration.
 * @param range
 */
generators.char = function*(options, range = 'A-Z') {
	range = new Range(range);

	while (true) {
		yield range.getRandom();
	}
};

/**
 * Returns true or false, with a given bias.
 *
 * @param {object} options Configuration.
 * @param {number} bias Number between 0 and 1: the higher to 1, the greater
 *                      the chance of true.
 */
generators.boolean = function*(options, bias = 0.5) {
	while (true) {
		yield Math.random() < bias;
	}
};

/**
 * Returns one of a given number of generators.
 *
 * @param {object} options Configuration.
 * @param {...string} generatorStrings A number of generators to choose from.
 */
generators.oneOf = function*(options, ...generatorStrings) {
	let generators = generatorStrings.map((str) => new Generator(str));

	while (true) {
		let generator = getRandomElementOf(generators);
		yield generator.resolve();
	}
};

/**
 * Returns an array generated from given generators.
 * @param {object} options Configuration.
 * @param {...string} generatorsStrings A number of generators.
 */
generators.array = function*(options, ...generatorsStrings) {
	let generators = generatorsStrings.map((str) => new Generator(str));
	let resolveGenerator = (generator) => generator.resolve();

	while (true) {
		let all = generators.map(resolveGenerator);

		// Promise.all will resolve immediately if none of the values are promises
		yield Promise.all(all);
	}
};

/**
 * Repeats a given generator a number of times.
 *
 * @param {object} options Configuration.
 * @param {number} n The number of times to repeat the generator.
 * @param {string} generatorString A generator as a string.
 */
generators.repeat = function*(options, n, generatorString) {
	let generator = new Generator(generatorString);

	let resolveGenerator = () => generator.resolve();
	let joinValues = (values) => values.join('');

	while (true) {
		// We call .fill() because .map() ignores holes
		let ary = new Array(n).fill('').map(resolveGenerator);
		yield Promise.all(ary).then(joinValues);
	}
};

/**
 * Returns a value specified as JSON.
 *
 * @param {object} options Configuration.
 * @param {string} json The value to return as JSON.
 */
generators.literal = function*(options, json) {
	let returnValue = JSON.parse(json);

	while (true) {
		yield returnValue;
	}
};

/**
 * Gets an entry from an object or array, specified in the options.
 *
 * @param {object} options Configuration.
 * @param {string} [prop="collection"] The property of the options to look at.
 */
generators.entry = function*(options, prop = 'collection') {
	let collection = options[prop];

	if (!collection) {
		throw new Error(`Collection ${prop} not found`);
	}

	while (true) {
		yield getRandomElementOf(collection);
	}
};

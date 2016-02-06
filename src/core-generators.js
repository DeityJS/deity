import regeneratorRuntime from 'regenerator/runtime-module'; // eslint-disable-line

import Range from './range';
import Generator from './generator';
import { getRandomElementOf, isNumeric, getYieldValue } from './util';

export function* string(options, range = '10-20') {
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
}

export function* number(options, range = '0-1', precision) {
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
}

export function* int(options, range = '0-10') {
	range = new Range(range);

	while (true) {
		yield range.getRandomInt();
	}
}

export function* char(options, range = 'A-Z') {
	range = new Range(range);

	while (true) {
		yield range.getRandom();
	}
}

export function* boolean(options, bias = 0.5) {
	while (true) {
		yield Math.random() < bias;
	}
}

export function* oneOf(options, ...generatorStrings) {
	let generators = generatorStrings.map((str) => new Generator(str));

	while (true) {
		let generator = getRandomElementOf(generators);
		yield generator.resolve();
	}
}

export function* array(options, ...generatorsStrings) {
	let generators = generatorsStrings.map((str) => new Generator(str));
	let resolveGenerator = (generator) => generator.resolve();

	while (true) {
		let all = generators.map(resolveGenerator);

		// Promise.all will resolve immediately if none of the values are promises
		yield Promise.all(all);
	}
}

export function* repeat(options, n, generatorString) {
	let generator = new Generator(generatorString);
	let repeatString = (val) => new Array(n + 1).join(val);

	while (true) {
		let resolved = generator.resolve();
		yield getYieldValue(resolved, repeatString);
	}
}

export function* literal(options, json) {
	let returnValue = JSON.parse(json);

	while (true) {
		yield returnValue;
	}
}

export function* entry(options, prop = 'collection') {
	let collection = options[prop];

	if (!collection) {
		throw new Error(`Collection ${prop} not found`);
	}

	while (true) {
		yield getRandomElementOf(collection);
	}
}

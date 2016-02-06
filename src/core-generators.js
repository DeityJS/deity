import regeneratorRuntime from 'regenerator/runtime-module';

import Range from './range';
import Generator from './generator';
import { getRandomElementOf, isNumeric } from './util';

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

		while (true) {
			yield generator.resolve().toString();
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

export function* array(options, ...generators) {
	generators = generators.map((str) => new Generator(str));

	while (true) {
		let generator = getRandomElementOf(generators);
		yield generator.resolve();
	}
}

export function* repeat(options, n, generatorString) {
	let generator = new Generator(generatorString);

	while (true) {
		let value = generator.resolve();
		yield new Array(n + 1).join(value);
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
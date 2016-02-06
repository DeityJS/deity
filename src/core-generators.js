import Range from './range';
import Generator from './generator';
import { getRandomElementOf, isNumeric } from './util';

export function string(options, range = '10-20') {
	let length = new Range(range).getRandomInt();
	let str = '';

	for (let i = 0; i < length; i++) {
		str += getRandomElementOf(options.letters);
	}

	return str;
}

export function number(options, range = '0-1', precision) {
	let random = new Range(range).getRandom();

	if (!isNumeric(precision)) {
		return random;
	}

	if (precision < 1) {
		return Number(random.toFixed(-Math.log10(precision)));
	}

	return Math.round(random / precision) * precision;
}

export function int(options, range = '0-10') {
	return new Range(range).getRandomInt();
}

export function char(options, range = 'A-Z') {
	return new Range(range).getRandom();
}

export function boolean(options, bias = 0.5) {
	return Math.random() < bias;
}

export function array(options, ...generators) {
	let generatorString = getRandomElementOf(generators);
	return new Generator(generatorString).resolve();
}

export function repeat(options, n, generatorString) {
	let value = new Generator(generatorString).resolve();
	return new Array(n + 1).join(value);
}
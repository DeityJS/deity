import * as generators from './core-generators';

export default function Generator(generatorString, opts) {
	let match;

	// Deal with 12*(generator)
	if ((match = /^(\d+)\*(\(.+\))$/.exec(generatorString))) {
		return new Generator(`repeat:${match[1]}:${match[2]}`, opts);
	}

	let splitString = [''];
	let inBrackets = false;

	for (let i = 0; i < generatorString.length; i++) {
		if (generatorString[i] === '(') {
			inBrackets = true;
		} else if (generatorString[i] === ')') {
			inBrackets = false;
		} else if (generatorString[i] === ':' && !inBrackets) {
			splitString.push('');
		} else {
			splitString[splitString.length - 1] += generatorString[i];
		}
	}

	let [type, ...args] = splitString;

	this._type = type;
	this._args = args;

	this.resolve = function () {
		return generators[type](opts, ...args);
	};
}
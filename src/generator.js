import * as generators from './core-generators';

export default function Generator(generatorString, opts) {
	let match;

	// Deal with 12*(generator)
	if ((match = /^(\d+)\*(\(.+\))$/.exec(generatorString))) {
		return new Generator(`repeat:${match[1]}:${match[2]}`, opts);
	}

	// Deal with 1-10
	if ((match = /^-?[\d.]+--?[\d.]+$/.exec(generatorString))) {
		return new Generator(`number:${match[0]}`);
	}

	// Deal with A-Z
	if ((match = /^[a-z]-[a-z]$/i.exec(generatorString))) {
		return new Generator(`char:${match[0]}`)
	}

	// Deal with "strings"
	if ((match = /^".+"$/.exec(generatorString))) {
		return new Generator(`literal:${match[0]}`);
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

	if (!generators[type]) {
		throw new Error(`Generator "${type}" not found`);
	}

	let generator = generators[type](opts, ...args);

	this.resolve = function (cb) {
		let value = generator.next().value;

		if (typeof cb === 'function') {
			if (typeof value.then === 'function') {
				value.then(cb);
			} else {
				cb(value)
			}
		} else {
			return value;
		}
	};
}
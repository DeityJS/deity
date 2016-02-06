'use strict';

import Range from './range';
import Generator from './generator';
import generators from './core-generators';

import objectAssign from 'object-assign';

export default function deity(generatorString, opts, fn) {
	if (typeof opts === 'function') {
		fn = opts;
		opts = {};
	}

	opts = objectAssign({}, deity.defaultOptions, opts);

	let generator = new Generator(generatorString, opts);

	for (let i = 0; i < opts.iterations; i++) {
		generator.resolve(fn);
	}
}

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

deity.defaultOptions = {
	iterations: 100,
	//letters: '1234567890ABCdefghjKLMNOpQRs',
	letters: new Range('A-Z')
};

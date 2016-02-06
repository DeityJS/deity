import Range from './range';
import Generator from './generator';
import * as generators from './core-generators';

import objectAssign from 'object-assign';

export default function deity(generatorString, opts, fn) {
	if (typeof opts === 'function') {
		fn = opts;
		opts = {};
	}

	opts = objectAssign({}, deity.defaultOptions, opts);

	let generator = new Generator(generatorString, opts);

	for (let i = 0; i < opts.iterations; i++) {
		fn(generator.resolve());
	}
}

deity.generators = generators;

deity.defaultOptions = {
	iterations: 100,
	//letters: '1234567890ABCdefghjKLMNOpQRs',
	letters: new Range('A-Z')
};

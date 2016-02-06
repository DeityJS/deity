export function isNumeric(obj) {
	if (Array.isArray(obj)) {
		return false;
	}

	return Math.abs(obj - parseFloat(obj)) + Number.EPSILON > 0;
}

export function getRandomElementOf(list) {
	if (typeof list.getRandom === 'function') {
		return list.getRandom();
	}

	if (list.length) {
		return list[Math.floor(Math.random() * list.length)];
	}

	return list[getRandomElementOf(Object.keys(list))];
}

/**
 * A small utility function for use in generators: calls a transform function
 * on either the specified value, or the result of the specified promise. I was
 * writing this a lot, so I split it out.
 *
 * @param {Promise|*} resolved A value that might be a promise.
 * @param {function} fn Transform function. Not a callback.
 * @returns {Promise|*} Either the transformed function, or a new promise
 * 											adding the transform function to specified promise.
 */
export function getYieldValue(resolved, fn) {
	if (typeof resolved.then === 'function') {
		return resolved.then(fn);
	} else {
		return fn(resolved);
	}
}
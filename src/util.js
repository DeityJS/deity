/**
 * Tests whether a variable is a number, or a numeric string.
 *
 * @param {string|number} maybeStr The variable to test.
 * @returns {boolean} True if numeric.
 */
export function isNumeric(maybeStr) {
	if (Array.isArray(maybeStr)) {
		return false;
	}

	return Math.abs(maybeStr - parseFloat(maybeStr)) + Number.EPSILON > 0;
}

/**
 * Gets a random element from a collection such as an object, array, or string
 * (where it gets a single character).
 *
 * @param {object|Array|string|Range} collection Thing to get the element from.
 * @returns {*} Element from the collection.
 */
export function getRandomElementOf(collection) {
	if (typeof collection.getRandom === 'function') {
		return collection.getRandom();
	}

	if (collection.length) {
		return collection[Math.floor(Math.random() * collection.length)];
	}

	return collection[getRandomElementOf(Object.keys(collection))];
}

/**
 * A small utility function for use in generators: calls a transform function
 * on either the specified value, or the result of the specified promise. I was
 * writing this a lot, so I split it out.
 *
 * @param {Promise|*} resolved A value that might be a promise.
 * @param {function} fn Transform function. Not a callback.
 * @returns {Promise|*} Either the transformed function, or a new promise
 *                      adding the transform function to specified promise.
 */
export function getYieldValue(resolved, fn) {
	if (typeof resolved.then === 'function') {
		return resolved.then(fn);
	}

	return fn(resolved);
}

/**
 * A minimal implementation of Object.assign(), which is not defined in node
 * 0.12.
 *
 * @param {object} target The element to copy properties to.
 * @param {...object} sources One or more objects to copy to the target.
 * @returns {object} Merged objects.
 */
export function objectAssign(target, ...sources) {
	for (let source of sources) {
		for (let key of Object.keys(source)) {
			target[key] = source[key];
		}
	}

	return target;
}
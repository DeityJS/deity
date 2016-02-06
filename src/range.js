import { isNumeric } from './util';

/**
 * A container for a range of numbers or characters with a few helpful
 * functions.
 *
 * @param {string} input The range, eg "1-10" or "D-T".
 * @constructor
 */
export default function Range(input) {
	input = /(-?[^-]+)-(-?[^-]+)/.exec(input);

	if (isNumeric(input[1]) && isNumeric(input[2])) {
		this.type = 'number';

		this.min = Number(input[1]);
		this.max = Number(input[2]);
	} else {
		this.type = 'char';

		this.min = input[1];
		this.max = input[2];

		this._minCharCode = this.min.charCodeAt(0);
		this._maxCharCode = this.max.charCodeAt(0);
	}
}

/**
 * Tests whether a given number or character is within the range.
 *
 * @param {string|number} num The number or character to test.
 * @returns {boolean} True if within the range.
 */
Range.prototype.isInRange = function (num) {
	return num <= this.max && num >= this.min;
};

/**
 * Gets a random character or number within the range.
 *
 * @returns {string|number} A random char or number.
 */
Range.prototype.getRandom = function () {
	if (this.type === 'number') {
		return (this.max - this.min) * Math.random() + this.min;
	}

	if (this.type === 'char') {
		let min = this._minCharCode;
		let max = this._maxCharCode;

		return String.fromCharCode((max - min) * Math.random() + min);
	}
};

/**
 * Gets a random integer within the range.
 *
 * @returns {number} A random integer.
 */
Range.prototype.getRandomInt = function () {
	return Math.floor((this.max + 1 - this.min) * Math.random() + this.min);
};

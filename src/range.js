import { isNumeric } from './util';

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

Range.prototype.isInRange = function (num) {
	return num <= this.max && num >= this.min;
};

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

Range.prototype.getRandomInt = function () {
	return Math.floor((this.max + 1 - this.min) * Math.random() + this.min);
};
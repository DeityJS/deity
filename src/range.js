import { isNumeric } from './util';

export default function Range(input) {
	input = input.split('-');

	if (isNumeric(input[0]) && isNumeric(input[1])) {
		this.type = 'number';

		this.min = Number(input[0]);
		this.max = Number(input[1]);
	} else {
		this.type = 'char';

		this.min = input[0];
		this.max = input[1];

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
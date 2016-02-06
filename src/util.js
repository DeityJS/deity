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

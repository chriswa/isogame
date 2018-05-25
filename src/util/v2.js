export function isEqual(a, b) {
	return a[0] === b[0] && a[1] === b[1]
}

export function manhattan(a, b) {
	if (!a || !b) { return Infinity }
	return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])
}

export function distance(a, b) {
	if (!a || !b) { return Infinity }
	const dx = a[0] - b[0]
	const dy = a[1] - b[1]
	return Math.sqrt(dx * dx + dy * dy)
}

export function create(x = 0, y = 0) {
	return [x, y]
}

export function copy(a, b) {
	b = b || []
	b[0] = a[0]
	b[1] = a[1]
	return b
}

export function lerp(a, b, t, c) {
	c = c || []
	c[0] = t * a[0] + (1 - t) * b[0]
	c[1] = t * a[1] + (1 - t) * b[1]
	return c
}

export function getFacing(a, b) {
	const dx = b[0] - a[0]
	const dz = b[1] - a[1]
	if (Math.abs(dx) > Math.abs(dz)) {
		return dx < 0 ? 3 : 1
	}
	else {
		return dz < 0 ? 0 : 2
	}
}

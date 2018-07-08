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

export function add(a, b, dst) {
	if (dst === undefined) { dst = create() }
	dst[0] = a[0] + b[0]
	dst[1] = a[1] + b[1]
	return dst
}

export function clone(a) {
	return [a[0], a[1]]
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
	if (!a || !b) { return 0 }
	const dx = b[0] - a[0]
	const dz = b[1] - a[1]
	if (Math.abs(dx) > Math.abs(dz)) {
		return dx < 0 ? 3 : 1
	}
	else {
		return dz < 0 ? 0 : 2
	}
}

export function facingToDelta(facing, range = 1) {
	facing = (facing + 4) % 4
	if (facing === 0) {
		return [0, -range]
	}
	else if (facing === 1) {
		return [range, 0]
	}
	else if (facing === 2) {
		return [0, range]
	}
	else if (facing === 3) {
		return [-range, 0]
	}
}

export function eachInRange(a, minDist, maxDist, callback) {
	const b = [0, 0]
	for (let dy = -maxDist; dy <= maxDist; dy += 1) {
		b[1] = a[1] + dy
		const xMaxDist = maxDist - Math.abs(dy)
		for (let dx = -xMaxDist; dx <= xMaxDist; dx += 1) {
			if (Math.abs(dx) + Math.abs(dy) >= minDist) {
				b[0] = a[0] + dx
				callback(b)
			}
		}
	}
}

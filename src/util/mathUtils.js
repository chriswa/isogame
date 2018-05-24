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

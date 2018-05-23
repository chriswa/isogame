// adapted from http://gizma.com/easing/
// see also https://gist.github.com/gre/1650294

const def = {
	linear(t) {
		return t
	},
	inQuad(t) {
		return t*t
	},
	outQuad(t) {
		return -t*(t-2)
	},
	inOutQuad(t) {
		t *= 2
		if (t < 1) { return 1/2*t*t }
		t--
		return -1/2 * (t*(t-2) - 1)
	},
	inCubic(t) {
		return c*t*t*t
	},
	outCubic(t) {
		t--
		return t*t*t + 1
	},
	inOutCubic(t) {
		t *= 2
		if (t < 1) { return 1/2*t*t*t }
		t -= 2
		return 1/2*(t*t*t + 2)
	},
	inQuart(t) {
		return t*t*t*t
	},
	outQuart(t) {
		t--
		return -1 * (t*t*t*t - 1)
	},
	inOutQuart(t) {
		t *= 2
		if (t < 1) { return 1/2*t*t*t*t }
		t -= 2
		return -1/2 * (t*t*t*t - 2)
	},
	inQuint(t) {
		return t*t*t*t*t
	},
	outQuint(t) {
		t--
		return t*t*t*t*t + 1
	},
	inOutQuint(t) {
		t *= 2
		if (t < 1) { return 1/2*t*t*t*t*t }
		t -= 2
		return 1/2*(t*t*t*t*t + 2)
	},
	inSine(t) {
		return -Math.cos(t * (Math.PI/2)) + 1
	},
	outSine(t) {
		return Math.sin(t * (Math.PI/2))
	},
	inOutSine(t) {
		return -1/2 * (Math.cos(Math.PI*t) - 1)
	},
	inExpo(t) {
		return Math.pow( 2, 10 * (t - 1) )
	},
	outExpo(t) {
		return ( -Math.pow( 2, -10 * t ) + 1 )
	},
	inOutExpo(t) {
		t *= 2
		if (t < 1) { return 1/2 * Math.pow( 2, 10 * (t - 1) ) }
		t--
		return 1/2 * ( -Math.pow( 2, -10 * t) + 2 )
	},
	inCirc(t) {
		return -(Math.sqrt(1 - t*t) - 1)
	},
	outCirc(t) {
		t--
		return Math.sqrt(1 - t*t)
	},
	inOutCirc(t) {
		t *= 2
		if (t < 1) { return -1/2 * (Math.sqrt(1 - t*t) - 1) }
		t -= 2
		return 1/2 * (Math.sqrt(1 - t*t) + 1)
	},
}

export default def

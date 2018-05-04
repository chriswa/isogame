export default class FBM {
	constructor(seed = 0, octaves_ = 4, lacunarity_ = 2, gain_ = 0.5, amplitude_ = 0.5, frequency_ = 1) {
		this.octaves = octaves_
		this.lacunarity = lacunarity_
		this.gain = gain_
		this.amplitude = amplitude_
		this.frequency = frequency_
		this.noise = new Noise(seed)
	}
	sample(x, y = 0, z = 0) {
		let a = this.amplitude
		let f = this.frequency
		let v = 0
		for (let i = 0; i < this.octaves; i += 1) {
			v += a * this.noise.simplex3(f * x, f * y, f * z)
			f *= this.lacunarity
			a *= this.gain
		}
		return v
	}
}

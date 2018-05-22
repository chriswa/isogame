export default class BitArray {
	constructor(size) {
		this.size = size
		this.array = new Uint32Array(Math.ceil(size / 32))
	}
	read(bitIndex) {
		const wordIndex = Math.floor(bitIndex / 32)
		const word = this.array[wordIndex]
		const bitmask = 1 << (bitIndex % 32)
		return ((word & bitmask) !== 0)
	}
	write(bitIndex, newValue) {
		const wordIndex = Math.floor(bitIndex / 32)
		let word = this.array[wordIndex]
		const bitmask = 1 << (bitIndex % 32)
		if (newValue) {
			word = word | bitmask
		}
		else {
			word = word & ~bitmask
		}
		this.array[wordIndex] = word
	}
}

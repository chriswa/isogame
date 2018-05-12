import BasePlaybackController from './base.js'

export default class SpellcastPlaybackController extends BasePlaybackController {
	init() {
		this.t = 0
		this.duration = 100
	}
	update(dt) {
		const remainingT = this.duration - this.t
		let consumedDt
		if (dt >= remainingT) {
			this.t = this.duration
			consumedDt = remainingT
		}
		else {
			this.t += dt
			consumedDt = dt
		}

		console.log(`pretend animation: t = ${ this.t / this.duration }`, this.result)

		return consumedDt
	}
	isComplete() {
		return this.t >= this.duration
	}
}

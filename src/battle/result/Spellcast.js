import { BaseResultPlayer, BaseResultAnimation } from './base.js'

class SpellcastAnimation extends BaseResultAnimation {
	init() {
		console.log(`SpellcastAnimation.init`, this.result)
		this.duration = 100
	}
	//onPartial(ratio) {
	//}
}

export default class extends BaseResultPlayer {
	static getAnimationClass() {
		return SpellcastAnimation
	}
	static updateModel(model, result) {
		;;;
	}
}

/*class SpellcastPlaybackController extends BaseResultPlayer {
	init() {
		this.t = 0
		this.duration = 100

		const unit = this.model.getUnitById(this.result.unitId)
		console.log(unit)
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

		//console.log(`pretend animation: t = ${ this.t / this.duration }`, this.result)

		return consumedDt
	}
	isComplete() {
		return this.t >= this.duration
	}
}*/
import BattleModel from '../BattleModel.js'

export default class BaseResult {
	constructor(model, resultData) {
		/** @type BattleModel */
		this.model = model
		this.resultData = resultData

		this.animationCurrentTime = 0
		this.animationDuration = 0
	}
	updateModel() {
	}
	getAnimationDurationMs() {
		return 0
	}
	startAnimation(view) {
		this.animationDuration = this.getAnimationDurationMs()
		this.animationStart(view)
	}
	updateAnimation(view, dt) {
		let remainingTime = this.animationDuration - this.animationCurrentTime
		// do we have enough time to complete this animation?
		if (dt > remainingTime) {
			this.animationCurrentTime = this.animationDuration
			this.animationComplete(view)
			return dt - remainingTime
		}
		else {
			this.animationCurrentTime += dt
			this.animationUpdate(view, this.animationCurrentTime / this.animationDuration)
			return 0
		}
	}
	animationUpdate(view, ratio) {
	}
	animationComplete(view) {
	}
}

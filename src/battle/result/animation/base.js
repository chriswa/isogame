import BattleModel from './../../BattleModel.js'
import BattleView from './../../BattleView.js'

export class BaseResultAnimation {
	constructor(model, view, result) {
		/** @type BattleModel */
		this.model = model
		/** @type BattleView */
		this.view = view
		this.result = result

		this.t = 0
		this.duration = 0


		this.init()
	}
	init() {
		// override me! (instead of declaring a constructor and having to call super())
		this.duration = 100
	}
	update(dt) {
		let remainingT = this.duration - this.t
		// do we have enough time to complete this animation?
		if (dt > remainingT) {
			this.t = this.duration
			this.onComplete()
			return dt - remainingT
		}
		else {
			this.t += dt
			this.onPartial(this.t / this.duration)
			return 0
		}
	}
	render() {
	}
	onPartial(ratio) {
	}
	onComplete() {
		this.onPartial(1)
	}
}

export class BaseResultPlayer {
	constructor() {
		throw new Error(`ResultPlayer classes are intended to be used staticly - do not instantiate!`)
	}
	static startAnimation(model, view, result) {
		const animationClass = this.getAnimationClass()
		return new animationClass(model, view, result)
	}
}

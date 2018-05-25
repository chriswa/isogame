import { BaseResultPlayer, BaseResultAnimation } from './base.js'

class SpellcastAnimation extends BaseResultAnimation {
	init() {
		console.log(`SpellcastAnimation.init`, this.result)
		this.duration = 1000
		this.view.unitSprites[ this.result.unitId ].startAnimation('CAST')
		this.view.setTopText(JSON.stringify(this.result))

	}
	onPartial(ratio) {
		this.view.setTopText(`Casting ${this.result.name} - ${Math.round(ratio * 100)}%`)
	}
	onComplete() {
		this.view.unitSprites[this.result.unitId].startAnimation('STAND')
	}
}

export default class extends BaseResultPlayer {
	static getAnimationClass() {
		return SpellcastAnimation
	}
	static updateModel(model, result) {
		;;;
	}
}

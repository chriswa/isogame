import BaseResultAnimation from './base.js'
import BattleModel from './../../BattleModel.js'

export default class TurnAnimation extends BaseResultAnimation {
	init() {
		//console.log(`TurnAnimation.init`, this.result)
		this.duration = 0
	}
	onPartial(ratio) {
	}
	onComplete() {
	}
}

import { BaseResultPlayer, BaseResultAnimation } from './base.js'
import BattleModel from './../../BattleModel.js'

export default class VictoryAnimation extends BaseResultAnimation {
	init() {
		console.log(`VictoryAnimation.init`, this.result)
		this.duration = 0
		this.view.setTopText(`Victory! ${this.result.victoryState}%`)
	}
	onPartial(ratio) {
	}
	onComplete() {
	}
}

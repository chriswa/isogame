import { BaseResultPlayer, BaseResultAnimation } from './base.js'
import BattleModel from './../BattleModel.js'

class VictoryAnimation extends BaseResultAnimation {
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

export default class VictoryResult extends BaseResultPlayer {
	static getAnimationClass() {
		return VictoryAnimation
	}
	/**
	 * @param {BattleModel} model 
	 * @param {*} result 
	 */
	static updateModel(model, result) {
		model.turn.victoryState = result.victoryState
	}
}

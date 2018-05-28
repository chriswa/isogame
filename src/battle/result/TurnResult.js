import { BaseResultPlayer, BaseResultAnimation } from './base.js'
import BattleModel from './../BattleModel.js'

class TurnAnimation extends BaseResultAnimation {
	init() {
		//console.log(`TurnAnimation.init`, this.result)
		this.duration = 0
	}
	onPartial(ratio) {
	}
	onComplete() {
	}
}

export default class TurnResult extends BaseResultPlayer {
	static getAnimationClass() {
		return TurnAnimation
	}
	/**
	 * @param {BattleModel} model 
	 * @param {*} result 
	 */
	static updateModel(model, result) {
		model.data.turn = {
			activeUnitId: result.activeUnitId,
		}
	}
}

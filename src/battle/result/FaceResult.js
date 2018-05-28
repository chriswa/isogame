import { BaseResultPlayer, BaseResultAnimation } from './base.js'
import BattleModel from './../BattleModel.js'

class FaceAnimation extends BaseResultAnimation {
	init() {
		this.duration = 0
		this.view.centerOnUnit(this.result.unitId)
	}
	onPartial(ratio) {
	}
	onComplete() {
		this.view.unitSprites[this.result.unitId].setFacing(this.result.target)
	}
}

export default class FaceResult extends BaseResultPlayer {
	static getAnimationClass() {
		return FaceAnimation
	}
	/**
	 * @param {BattleModel} model 
	 * @param {*} result 
	 */
	static updateModel(model, result) {
		const unit = model.getUnitById(result.unitId)
		unit.facing = result.target
		unit.nextTurnTime += 100 // FIXME: this is too simple of a solution to support time magic
		model.turn.stage = 'end'
	}
}

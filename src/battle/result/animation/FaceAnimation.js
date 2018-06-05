import { BaseResultPlayer, BaseResultAnimation } from './base.js'
import BattleModel from './../../BattleModel.js'

export default class FaceAnimation extends BaseResultAnimation {
	init() {
		this.duration = 0
		this.view.centerOnUnitId(this.result.unitId)
	}
	onPartial(ratio) {
	}
	onComplete() {
		this.view.unitSprites[this.result.unitId].setFacing(this.result.target)
	}
}

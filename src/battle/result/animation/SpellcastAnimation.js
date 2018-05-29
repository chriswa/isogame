import { BaseResultPlayer, BaseResultAnimation } from './base.js'
import BattleModel from './../../BattleModel.js'

export default class SpellcastAnimation extends BaseResultAnimation {
	init() {
		console.log(`SpellcastAnimation.init`, this.result)
		this.duration = 1000
		this.view.unitSprites[ this.result.unitId ].startAnimation('CAST')
		this.view.setTopText(JSON.stringify(this.result))
		this.view.centerOnUnit(this.result.unitId)
	}
	onPartial(ratio) {
		this.view.setTopText(`Casting ${this.result.name} - ${Math.round(ratio * 100)}%`)
	}
	onComplete() {
		this.view.unitSprites[this.result.unitId].startAnimation('IDLE')
	}
}

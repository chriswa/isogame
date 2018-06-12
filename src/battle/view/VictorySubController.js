import BaseSubController from './BaseSubController.js'
import BattleGUI from '../../gui/battle/BattleGUI.js'
import * as camera from '../../gfx/camera.js'
import easings from '../../util/easings.js'

export default class VictorySubController extends BaseSubController {
	constructor(battleController) {
		super(battleController)
		this.age = 0
		this.startY = 0
	}
	update(dt) {
		this.age += dt
		const t = this.age / 3000
		camera.position[1] = this.startY + easings.inQuad(t) * 30
		camera.rotation[1] += dt * 0.0001
	}
	render() {
	}
	onStateEnter() {
		this.view.setTopText('VictorySubController: ' + JSON.stringify(this.model.getVictoryState()))
		this.age = 0
		this.startY = camera.position[1]

		// TODO: some kinda GUI instead of just waiting
		setTimeout(() => {
			this.battleController.onDismissBattle()
		}, 2000)
	}
	onStateExit() {
	}
}

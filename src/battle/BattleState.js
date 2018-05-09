import * as fieldBuilder from './field/fieldBuilder.js'
import BattleModel from './BattleModel.js'
import BattleView from './BattleView.js'

export default class Battle {

	constructor(fieldDescriptor, unitsDescriptor) {

		const { fieldView, fieldModel } = fieldBuilder.build(fieldDescriptor)

		this.battleModel = new BattleModel({
			field: fieldModel,
			turn: {},
			units: unitsDescriptor,
		})

		this.battleView = new BattleView(fieldView, this.battleModel)

	}

	update(dt) {
		this.battleView.update(dt)
	}

	render() {
		this.battleView.render()
	}
	
}

import BattleModel from '../../battle/BattleModel.js'

/** @type {BattleModel} */
export let battleModel = undefined

export function setBattleModel(newBattleModel) {
	battleModel = newBattleModel
}

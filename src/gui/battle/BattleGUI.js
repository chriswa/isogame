import { battleModel, setBattleModel } from './battleModel.js'
import UnitPanel from './UnitPanel.js'
import TopText from './TopText.js'

let battleControllerOnSelectAbility

export default new Vue({
	el: '#battleGuiMount',
	data() {
		return {
			battleModelHack: 0,
			selectedUnitId: undefined,
			selectedAbilityId: undefined,
			topText: "",
		}
	},
	template: `
		<div class="guiRoot">
			<div v-if="battleModel">
				<TopText
					:text="topText"
				></TopText>
				<UnitPanel
					v-if="selectedUnitId !== undefined"
					:selectedUnitId="selectedUnitId"
					:selectedAbilityId="selectedAbilityId"
					@selectAbilityId="selectAbilityId"
				></UnitPanel>
			</div>
		</div>
	`,
	computed: {
		battleModel() {
			this.battleModelHack // force computed to depend on watched key
			console.log(`computed battleModel`, battleModel)
			return battleModel
		}
	},
	methods: {
		init(battleModel_, battleControllerOnSelectAbility_) {
			battleControllerOnSelectAbility = battleControllerOnSelectAbility_
			setBattleModel(battleModel_)
			this.battleModelHack += 1 // force update
		},
		setTopText(text) {
			this.topText = text
		},
		selectUnitId(unitId) {
			this.selectedUnitId = unitId
			this.selectAbilityId(1) // TODO: find appropriate ability to select (always 1(move) unless unit is ownedAndActive, then it depends on battleModel.turn.*)
			if (this.battleModel.isItMyTurn()) {
				this.topText = 'Your turn'
			}
			else {
				this.topText = 'Waiting for opponent...'
			}
		},
		selectAbilityId(abilityId) {
			this.selectedAbilityId = abilityId
			battleControllerOnSelectAbility(abilityId)
		},
	},
})

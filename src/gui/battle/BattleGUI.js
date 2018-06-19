import { battleModel, setBattleModel } from './battleModel.js'
import UnitPanel from './UnitPanel.js'
import TopText from './TopText.js'
import Tooltip from './Tooltip.js'

let battleControllerOnSelectAbility

const vm = new Vue({
	el: '#battleGuiMount',
	data() {
		return {
			battleModelHack: 0,
			battleModelUpdateCounter: 0,
			selectedUnitId: undefined,
			selectedAbilityId: undefined,
			topText: '',
			tooltipHtml: '',/*`
				<div class="manaCost">30 mana</div>
				<h1>Hello Tooltip!</h1>
				<p>Testing 123</p>
				<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque interdum in tellus ac commodo. Duis sed ipsum et purus condimentum suscipit ac et enim.</p>
				<p>Nunc vestibulum fringilla iaculis. Vivamus ut consequat libero, at tempor magna. Sed id turpis congue, dignissim nunc ac, viverra orci.</p>
			`,*/
		}
	},
	template: `
		<div class="guiRoot">
			<div v-if="battleModel" :key="battleModelUpdateCounter">
				<TopText
					:text="topText"
				></TopText>
				<UnitPanel
					v-if="selectedUnitId !== undefined"
					:selectedUnitId="selectedUnitId"
					:selectedAbilityId="selectedAbilityId"
					@selectAbilityId="selectAbilityId"
				></UnitPanel>
				<Tooltip
					v-if="tooltipHtml"
					:html="tooltipHtml"
				></Tooltip> <!-- TODO: listen for tooltip event from descendents -->
			</div>
		</div>
	`,
	computed: {
		battleModel() {
			this.battleModelHack // force computed to depend on watched key
			return battleModel
		}
	},
	methods: {
		init(battleModel_, battleControllerOnSelectAbility_) {
			battleControllerOnSelectAbility = battleControllerOnSelectAbility_
			setBattleModel(battleModel_)
			this.battleModelHack += 1 // force update
		},
		hide() {
			setBattleModel(undefined)
			this.battleModelHack += 1 // force update
		},
		forceUpdateAll() {
			this.battleModelUpdateCounter += 1
		},
		setTopText(text) {
			this.topText = text
		},
		selectUnitId(unitId) {
			this.selectedUnitId = unitId
			if (this.battleModel.isItMyTurn()) {
				this.topText = 'Your turn'
			}
			else {
				this.topText = 'Waiting for opponent...'
			}
			// pre-select either "move"(1) or "face"(0), depending on whether moves remain
			if (this.selectedUnitId !== undefined) {
				const moveAbility = battleModel.getAbilityById(this.selectedUnitId, 1)
				const preSelectedAbilityId = moveAbility.isEnabled() ? 1 : 0
				this.selectAbilityId(preSelectedAbilityId)
			}
		},
		selectAbilityId(abilityId) {
			this.selectedAbilityId = abilityId
			battleControllerOnSelectAbility(abilityId)
		},
	},
})

vm.$on('tooltip', (html) => {
	vm.tooltipHtml = html
})

export default vm

import { battleModel } from './battleModel.js'
import addCssRule from './../addCssRule.js'
import UnitStats from './UnitStats.js'
import AbilityButton from './AbilityButton.js'

const COMPONENT_NAME = 'UnitPanel'

addCssRule(`.${COMPONENT_NAME} {
	position: absolute;
	background-color: #654321;
	color: white;
	bottom: 0;
	height: 90px;
	width: 100vw;
}`)

addCssRule(`.${COMPONENT_NAME} .unitStats {
	float: left;
	margin-left: 120px;
	margin-bottom: 5px;
	margin-top: 5px;
	height: 80px;
}`)
addCssRule(`.${COMPONENT_NAME} .unitAbilities {
	float: right;
	margin: 5px;
	text-align: right;
}`)
addCssRule(`.${COMPONENT_NAME} .unitPortrait {
	position: absolute;
	left: 0;
	bottom: 0;
	width: 112px;
	height: 112px;
}`)

export default Vue.component(COMPONENT_NAME, {
	props: ['selectedUnitId', 'selectedAbilityId'],
	data() {
		return {
		}
	},
	template: `
		<div class="${COMPONENT_NAME}">
			<img class="unitPortrait" :src="portraitSrc" onclick="location.reload()"><!-- reload on click for convenience when testing on mobile -->
			<div class="unitStats">
				<UnitStats
					:unitId="selectedUnitId"
				></UnitStats>
			</div>
			<div class="unitAbilities">
				<AbilityButton
					v-for="abilityId in abilityIds"
					:key="abilityId"
					:unitId="selectedUnitId"
					:abilityId="abilityId"
					:isSelected="selectedAbilityId === abilityId"
					@click="$emit('selectAbilityId', abilityId)"
				></AbilityButton>
			</div>
		</div>
	`,
	computed: {
		abilityIds() {
			return [ ..._.range(1,10), 0 ]
		},
		unit() {
			return battleModel.getUnitById(this.selectedUnitId)
		},
		portraitSrc() {
			return `assets/portraits/${this.unit.spriteSet}.png`
		},
	},
})

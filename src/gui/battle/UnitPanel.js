import { battleModel } from './battleModel.js'
import addCssRule from './../addCssRule.js'
import AbilityButton from './AbilityButton.js'

const COMPONENT_NAME = 'UnitPanel'

addCssRule(`.${COMPONENT_NAME} {
	position: absolute;
	background-color: #654321;
	color: white;
	bottom: 0;
	height: calc(4vw + 10px);
	width: 100vw;
}`)

addCssRule(`.${COMPONENT_NAME} #unitName {
	float: left;
	margin-left: 120px;
}`)
addCssRule(`.${COMPONENT_NAME} #unitAbilities {
	float: right;
	margin: 5px;
	text-align: right;
}`)
addCssRule(`.${COMPONENT_NAME} #unitPortrait {
	position: absolute;
	left: 0;
	bottom: 0;
	zoom: 2;
}`)

export default Vue.component(COMPONENT_NAME, {
	props: ['selectedUnitId', 'selectedAbilityId'],
	data() {
		return {
		}
	},
	template: `
		<div class="${COMPONENT_NAME}" id="unitPanel">
			<img id="unitPortrait" src="assets/sample_portrait.png">
			<div id="unitName">{{ name }}</div>
			<div id="unitAbilities">
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
		name() {
			const unit = battleModel.getUnitById(this.selectedUnitId)
			return unit ? unit.name : 'UNDEFINED'
		},
	},
})

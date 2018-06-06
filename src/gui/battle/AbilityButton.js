import { battleModel } from './battleModel.js'
import addCssRule from './../addCssRule.js'
import AbilityArchetypes from '../../battle/AbilityArchetypes.js'

const COMPONENT_NAME = 'AbilityButton'

addCssRule(`.${COMPONENT_NAME} {
	background-color: #000;
	width: 4vw;
	height: 4vw;
	color: white;
	padding: 5px;

	border: 2px solid rgb(54, 54, 54);
	margin: 0;
	overflow: visible;
	font: inherit;
	line-height: normal;
	-webkit-font-smoothing: inherit;
	-moz-osx-font-smoothing: inherit;
	-webkit-appearance: none;
}`)
addCssRule(`.${COMPONENT_NAME}.selected {
	border: 2px solid rgb(255, 255, 255);
}`)
addCssRule(`.${COMPONENT_NAME}.enabled:hover {
	background-color: #666;
}`)
addCssRule(`.${COMPONENT_NAME}.enabled:active {
	background-color: #ccc;
}`)
addCssRule(`.${COMPONENT_NAME}.disabled > img {
	opacity: 0.5;
}`)

addCssRule(`.${COMPONENT_NAME} > img {
	width: 100%;
	height: 100%;
}`)


export default Vue.component(COMPONENT_NAME, {
	props: ['abilityId', 'isSelected', 'unitId'],
	data() {
		return {
		}
	},
	template: `
		<button
			:class="{ ${COMPONENT_NAME}: true, selected: isSelected, enabled: isCastable, disabled: !isCastable }"
			@click="isCastable && $emit('click')"
			@mouseover="onMouseover"
			@mouseout="onMouseout"
			:disabled="!abilityImage"
		>
			<img
				v-if="abilityImage"
				:src="abilityImage"
			>
		</button>
	`,
	methods: {
		onMouseover() {
			this.$root.$emit('tooltip', this.tooltip)
		},
		onMouseout() {
			this.$root.$emit('tooltip', undefined)
		},
	},
	computed: {
		ability() {
			const unitAbility = battleModel.units[this.unitId].abilities[this.abilityId]
			const ability = unitAbility ? AbilityArchetypes[unitAbility.abilityType] : undefined
			return ability
		},
		abilityImage() {
			return this.ability ? 'assets/game-icons-net/' + this.ability.getImage() + '.png' : undefined
		},
		isCastable() {
			return this.ability ? this.ability.getCastable(battleModel, this.unitId, this.abilityId) : false
		},
		tooltip() {
			return this.ability ? this.ability.getTooltip(battleModel, this.unitId, this.abilityId) : undefined
		},
	},
})

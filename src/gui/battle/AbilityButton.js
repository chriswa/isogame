import { battleModel } from './battleModel.js'
import addCssRule from './../addCssRule.js'
import Abilities from '../../battle/Abilities.js'

const COMPONENT_NAME = 'AbilityButton'

addCssRule(`.${COMPONENT_NAME} {
	background-color: #000;
	width: 4vw;
	height: 4vw;
	color: white;
	padding: 5px;

	border: 2px solid #333;
	margin: 0;
	overflow: visible;
	font: inherit;
	line-height: normal;
	-webkit-font-smoothing: inherit;
	-moz-osx-font-smoothing: inherit;
	-webkit-appearance: none;
}`)
addCssRule(`.${COMPONENT_NAME}.selected {
	border: 2px solid #fff;
}`)
addCssRule(`.${COMPONENT_NAME}.enabled:hover {
	background-color: #666;
}`)
addCssRule(`.${COMPONENT_NAME}.enabled:active {
	background-color: #ccc;
}`)
addCssRule(`.${COMPONENT_NAME}.disabled {
	border: 2px solid #333;
	background-color: #222;
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
			return battleModel.getAbilityById(this.unitId, this.abilityId)
		},
		abilityImage() {
			return this.ability ? 'assets/game-icons-net/' + this.ability.getImage() + '.png' : undefined
		},
		isCastable() {
			return this.ability ? this.ability.getCastable() : false
		},
		tooltip() {
			return this.ability ? this.ability.getTooltip() : undefined
		},
	},
})

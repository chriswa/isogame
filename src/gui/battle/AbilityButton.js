import { battleModel } from './battleModel.js'
import addCssRule from './../addCssRule.js'

const COMPONENT_NAME = 'AbilityButton'

addCssRule(`.${COMPONENT_NAME} {
	background-color: #000;
	width: 4vw;
	height: 4vw;
	color: white;

	border: 2px solid rgb(54, 54, 54);
	margin: 0;
	padding: 0;
	overflow: visible;
	font: inherit;
	line-height: normal;
	-webkit-font-smoothing: inherit;
	-moz-osx-font-smoothing: inherit;
	-webkit-appearance: none;
}`)
addCssRule(`.${COMPONENT_NAME}.active {
	border: 2px solid rgb(255, 255, 255);
}`)
addCssRule(`.${COMPONENT_NAME}:hover {
	background-color: #666;
}`)
addCssRule(`.${COMPONENT_NAME}:active {
	background-color: #ccc;
}`)


export default Vue.component(COMPONENT_NAME, {
	props: ['abilityId', 'isActive'],
	data() {
		return {
		}
	},
	template: `
		<button
			:class="{ ${COMPONENT_NAME}: true, active: isActive }"
			@click="$emit('click')"
		>{{ abilityId }}</button>
	`,
	computed: {
	},
})

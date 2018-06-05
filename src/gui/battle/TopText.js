import { battleModel } from './battleModel.js'
import addCssRule from './../addCssRule.js'

const COMPONENT_NAME = 'TopText'

addCssRule(`.${COMPONENT_NAME} {
	pointer-events: none;
	color: white;
	font-size: calc(14px + 2vw);
	position: absolute;
	top: 10vh;
	left: 0;
	width: 100vw;
	text-align: center;
	text-shadow: -2px 0 1px black, 0 2px 1px black, 2px 0 1px black, 0 -2px 1px black,
		-2px -2px 1px black, 2px 2px 1px black, 2px -2px 1px black, -2px 2px 1px black;
}`)

export default Vue.component(COMPONENT_NAME, {
	props: ['text'],
	data() {
		return {
		}
	},
	template: `
		<div class="${COMPONENT_NAME}">
			{{ text }}
		</div>
	`,
	computed: {
	},
})

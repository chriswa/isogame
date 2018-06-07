import { battleModel } from './battleModel.js'
import addCssRule from './../addCssRule.js'
import StatBar from './StatBar.js'

const COMPONENT_NAME = 'StatBar'

addCssRule(`.${COMPONENT_NAME} {
	width: 5vw;
	height: 10px;
	border: 1px solid white;
	display: inline-block;
	position: relative;
}`)
addCssRule(`.${COMPONENT_NAME} > .bar {
	position: absolute;
	height: 100%;
}`)
addCssRule(`.${COMPONENT_NAME} > .text {
	position: absolute;
	width: 100%;
	text-align: center;
	margin: auto;
	font-size: 70%;
}`)

export default Vue.component(COMPONENT_NAME, {
	props: ['amount', 'max', 'fgColor', 'bgColor'],
	template: `
		<div class="${COMPONENT_NAME}" :style="{ backgroundColor: bgColor }">
			<div class="bar" :style="{ width: innerWidth, backgroundColor: fgColor }"></div>
			<div class="text">{{ amount }} / {{ max }}</div>
		</div>
	`,
	computed: {
		innerWidth() {
			if (!this.max) { return '0' }
			return (Math.round((this.amount / this.max) * 100 * 1000) / 1000) + '%'
		},
	},
})

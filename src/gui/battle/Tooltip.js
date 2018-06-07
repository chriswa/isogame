import addCssRule from './../addCssRule.js'

const COMPONENT_NAME = 'Tooltip'

addCssRule(`.${COMPONENT_NAME} {
	position: absolute;
	bottom: calc(4vw + 20px);
	right: 10px;
	max-width: 30vw;
	min-width: 20vw;

	padding: 2px;
	border-radius: 25px;
	border: 3px solid black;

	background-color: white;
	color: white;

}`)

addCssRule(`.${COMPONENT_NAME} > .inner {
	padding: 12px;

	border-radius: 20px;

	background-color: #333;
	color: white;

}`)

addCssRule(`.${COMPONENT_NAME} h1 {
	font-size: 130%;
	font-weight: bold;
	margin-bottom: 15px;
}`)
addCssRule(`.${COMPONENT_NAME} .manaCost {
	float: right;
	color: cyan;
}`)
addCssRule(`.${COMPONENT_NAME} p {
	margin-top: 10px;
}`)

export default Vue.component(COMPONENT_NAME, {
	props: ['html'],
	data() {
		return {
		}
	},
	template: `
		<div class="${COMPONENT_NAME}">
			<div class="inner" v-html="html">
			</div>
		</div>
	`,
	computed: {
	},
})

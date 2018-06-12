import addCssRule from './../addCssRule.js'

const COMPONENT_NAME = 'MatchMakerButton'

addCssRule(`.${COMPONENT_NAME} {
}`)

export default Vue.component(COMPONENT_NAME, {
	props: ['activeMatchTypes'],
	data() {
		return {
		}
	},
	template: `
		<div class="${COMPONENT_NAME}" @mouseover="onMouseover" @mouseout="onMouseout">
		</div>
	`,
	computed: {
	},
	methods: {
		onMouseover(tooltip) {
			//this.$root.$emit('tooltip', '<h1>Matchmaker</h1><p>You are currently looking for ... TODO</p>')
		},
		onMouseout() {
			//this.$root.$emit('tooltip', undefined)
		},
	},
})

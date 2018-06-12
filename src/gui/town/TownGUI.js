const vm = new Vue({
	el: '#townGuiMount',
	data() {
		return {
			isActive: false,
			matchMakerSubscriptions: [],
		}
	},
	template: `
		<div class="guiRoot">
			<div v-if="isActive">
				<h1>Welcome to town.</h1>
				<button @click="startLocal">Start Local Battle</button>
				<button @click="startChallenge">Start Challenge Battle (supervised by server)</button>
				<button @click="matchMakerSubscribe">MatchMaker Subscribe (SIMPLE_PVP)</button>
				<button @click="matchMakerUnsubscribe">MatchMaker Unsubscribe (SIMPLE_PVP)</button>
				<button @click="matchMakerUnsubscribeAll">MatchMaker Unsubscribe All</button>
			</div>
		</div>
	`,
	computed: {
	},
	methods: {
		reset() {
			this.matchMakerSubscriptions = []
		},
		startLocal() {
			this.$emit('startLocal')
		},
		startChallenge() {
			this.$emit('startChallenge')
		},
		matchMakerSubscribe() {
			this.$emit('matchMakerSubscribe')
		},
		matchMakerUnsubscribe() {
			this.$emit('matchMakerUnsubscribe')
		},
		matchMakerUnsubscribeAll() {
			this.$emit('matchMakerUnsubscribeAll')
		},
	},
})

//vm.$on('tooltip', (html) => {
//	vm.tooltipHtml = html
//})

export default vm

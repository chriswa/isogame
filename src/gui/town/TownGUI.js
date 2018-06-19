import addCssRule from './../addCssRule.js'

addCssRule(`#townGui {
	color: white;
}`)
addCssRule(`#townGui h1 {
	font-size: 300%;
	margin: 20px;
}`)
addCssRule(`#townGui h2 {
	font-size: 150%;
	margin-bottom: 10px;
}`)
addCssRule(`#townGui .section {
	border: 1px solid white;
	margin: 10px;
	padding: 20px;
	max-width: 400px;
	background-color: rgba(255, 255, 255, 0.1);
	border-radius: 5px;
}`)
addCssRule(`#townGui button {
	padding: 10px;
	border-radius: 5px;
	border: 2px solid black;
	background-color: white;
	display: block;
	margin-bottom: 2px;
}`)
addCssRule(`#townGui button:hover {
	background-color: #ffa;
}`)
addCssRule(`#townGui button:active {
	background-color: #faa;
}`)

const vm = new Vue({
	el: '#townGuiMount',
	data() {
		return {
			isActive: false,
			isConnected: false,
			matchMakerSubscriptions: [],
		}
	},
	template: `
		<div class="guiRoot" id="townGui">
			<div v-if="isActive">
				<h1>TownGUI</h1>
				<div class="section">
					<button @click="startLocal('Local1')">Local1</button>
				</div>
				<div class="section" v-if="!isConnected">
					<p>Connecting to server...</p>
				</div>
				<div class="section" v-if="isConnected">
					<button @click="startChallenge('Challenge1')">Challenge1</button>
				</div>
				<div class="section" v-if="isConnected">
					<button @click="matchMakerSubscribe('SIMPLE_PVP')">Subscribe (SIMPLE_PVP)</button>
					<button @click="matchMakerUnsubscribe('SIMPLE_PVP')">Unsubscribe (SIMPLE_PVP)</button>
					<button @click="matchMakerUnsubscribeAll">Unsubscribe All</button>
				</div>
		</div>
		</div>
	`,
	computed: {
	},
	methods: {
		reset() {
			this.matchMakerSubscriptions = []
		},
		startLocal(localBattleType) {
			this.$emit('startLocal', localBattleType)
		},
		startChallenge(challengeId) {
			this.$emit('startChallenge', challengeId)
		},
		matchMakerSubscribe(matchType) {
			this.$emit('matchMakerSubscribe', matchType)
		},
		matchMakerUnsubscribe(matchType) {
			this.$emit('matchMakerUnsubscribe', matchType)
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

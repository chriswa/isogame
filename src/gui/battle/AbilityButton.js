import { battleModel } from './battleModel.js'
import addCssRule from './../addCssRule.js'

const COMPONENT_NAME = 'AbilityButton'

addCssRule(`.${COMPONENT_NAME} {
	background-color: #000;
	width: 76px;
	height: 76px;
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
addCssRule(`@media only screen and (max-width: 1000px) {
	.${COMPONENT_NAME} {
		width: 50px;
		height: 50px;
	}
}`)
addCssRule(`@media only screen and (max-width: 700px) {
	.${COMPONENT_NAME} {
		width: 30px;
		height: 30px;
	}
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
			isTouchStillTargeted: false,
		}
	},
	template: `
		<button
			:class="{ ${COMPONENT_NAME}: true, selected: isSelected, enabled: isCastable, disabled: !isCastable }"
			@click="onClick"
			@mouseover="onMouseover"
			@mouseout="onMouseout"
			@touchstart="onTouchstart"
			@touchmove="onTouchmove"
			@touchend="onTouchend"
			:disabled="!abilityImage"
		>
			<img
				v-if="abilityImage"
				:src="abilityImage"
			>
		</button>
	`,
	methods: {
		onClick() {
			if (this.isCastable) {
				this.$emit('click')
			}
		},
		onMouseover() {
			this.$root.$emit('tooltip', this.tooltip)
		},
		onMouseout() {
			this.$root.$emit('tooltip', undefined)
		},
		onTouchstart(e) {
			if (e.touches.length === 1) {
				this.$root.$emit('tooltip', this.tooltip)
				this.isTouchStillTargeted = true
			}
			else {
				this.$root.$emit('tooltip', undefined)
				this.isTouchStillTargeted = false
			}
			e.preventDefault()
		},
		onTouchmove(e) {
			const touch0 = e.touches[0]
			const elementUnderFinger = document.elementFromPoint(touch0.pageX, touch0.pageY)
			if (elementUnderFinger !== e.target) {
				this.$root.$emit('tooltip', undefined)
				this.isTouchStillTargeted = false
			}
		},
		onTouchend(e) {
			this.$root.$emit('tooltip', undefined)
			if (this.isTouchStillTargeted) {
				const touch0 = e.changedTouches[0]
				const elementUnderFinger = document.elementFromPoint(touch0.pageX, touch0.pageY)
				if (elementUnderFinger === e.target) {
					this.onClick()
				}
			}
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
			return this.ability ? this.ability.isEnabled() : false
		},
		tooltip() {
			return this.ability ? this.ability.getTooltip() : undefined
		},
	},
})

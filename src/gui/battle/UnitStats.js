import { battleModel } from './battleModel.js'
import addCssRule from './../addCssRule.js'
import StatBar from './StatBar.js'

const COMPONENT_NAME = 'UnitStats'

addCssRule(`.${COMPONENT_NAME} > .unitName {
	font-size: 120%;
	font-weight: bold;
	margin-bottom: 4px;
}`)

export default Vue.component(COMPONENT_NAME, {
	props: ['unitId'],
	data() {
		return {
		}
	},
	template: `
		<div class="${COMPONENT_NAME}">
			<div class="unitName">{{ unit.name }}</div>
			<div @mouseover="onMouseover('Health')" @mouseout="onMouseout">
				<StatBar fgColor="#090" bgColor="#030" :amount="unit.hp" :max="unit.hpMax"></StatBar>
			</div>
			<div @mouseover="onMouseover('Mana')" @mouseout="onMouseout">
				<StatBar fgColor="#039" bgColor="#013" :amount="unit.mana" :max="unit.manaMax"></StatBar>
			</div>
			<div v-if="isActiveUnit">...</div>
			<div v-else>Next turn in {{ nextTurnDelta }}</div>
		</div>
	`,
	computed: {
		unit() {
			return battleModel.getUnitById(this.unitId)
		},
		isActiveUnit() {
			console.log(this.unitId, battleModel.getActiveUnitId(), this.unitId === battleModel.getActiveUnitId())
			return this.unitId === battleModel.getActiveUnitId()
		},
		nextTurnDelta() {
			const currentTime = battleModel.getUnitById(battleModel.getActiveUnitId()).nextTurnTime
			return this.unit.nextTurnTime - currentTime
		},
	},
	methods: {
		onMouseover(tooltip) {
			this.$root.$emit('tooltip', tooltip)
		},
		onMouseout() {
			this.$root.$emit('tooltip', undefined)
		},
	},
})

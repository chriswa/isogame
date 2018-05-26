import { EventSubscriber } from './../util/domUtils.js'

export default class unitPanel {
	constructor(model, view, onSelectAbility) {
		this.model = model
		this.view = view
		this.onSelectAbility = onSelectAbility

		this.eventSubscriber = new EventSubscriber()

		this.elements = { // assuming there will only ever be one UnitPanel!
			container: document.getElementById('unitPanel'),
			name: document.getElementById('unitName'),
			portrait: document.getElementById('unitPortrait'),
			abilityButtonsContainer: document.getElementById('unitAbilities'),
			abilityButtons: Array.from(document.getElementById('unitAbilities').children),
		}

		_.each(this.elements.abilityButtons, (el, idx) => {
			this.eventSubscriber.subscribe(el, 'click', () => {
				this.selectAbility(idx)
			})
		})
	}
	destroy() { // FIXME: this is never called!
		this.eventSubscriber.unsubscribeAll()
	}
	selectAbility(abilityId) {
		_.each(this.elements.abilityButtons, (el) => { el.classList.remove('active') })
		const el = this.elements.abilityButtons[abilityId]
		el.classList.add('active')

		this.onSelectAbility(abilityId)
	}
	initForUnit(unitId) {
		const unit = this.model.getUnitById(unitId)

		this.elements.name.innerText = unit.name

		_.each(this.elements.abilityButtons, (el, idx) => {

			//el.classList.remove('active')

			const ability = unit.abilities[idx]
			if (ability) {
				el.disabled = false
				el.innerText = ability.abilityType
			}
			else {
				el.disabled = true
				el.innerText = '-'
			}
		})

		this.selectAbility(1)

	}
}

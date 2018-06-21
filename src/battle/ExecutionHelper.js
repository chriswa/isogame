export default class ExecutionHelper {
	constructor(model, applyResultCallback) {
		this.model = model
		this.applyResultCallback = applyResultCallback
	}
	result(type, payload) {
		const result = { type, ...payload }
		this.applyResultCallback(result)
	}
	hurt(unitId, damageAmount, damageType) {
		// TODO: damage resistances (specific to damageTypes)
		const unit = this.model.getUnitById(unitId)
		this.result('Hurt', { unitId, damageAmount, damageType })
		if (unit.hp <= 0) {
			this.result('Death', { unitId })
		}
	}
}

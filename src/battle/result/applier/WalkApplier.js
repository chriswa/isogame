import * as v2 from './../../../util/v2.js'

export default function updateModel(model, result) {
	const unit = model.getUnitById(result.unitId)
	v2.copy(result.target, unit.pos)
	model.turn.movementUsed = (model.turn.movementUsed || 0) + 1
}

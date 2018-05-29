export default function updateModel(model, result) {
	const unit = model.getUnitById(result.unitId)
	unit.facing = result.target
	unit.nextTurnTime += 100 // FIXME: this is too simple of a solution to support time magic
	model.turn.stage = 'end'
}

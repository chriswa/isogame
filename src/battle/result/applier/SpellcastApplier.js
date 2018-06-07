export default function updateModel(model, result) {
	model.turn.actionUsed = true
	if (result.manaCost) {
		const unit = model.getUnitById(result.unitId)
		unit.mana -= result.manaCost
	}
}

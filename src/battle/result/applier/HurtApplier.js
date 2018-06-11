export default function updateModel(model, result) {
	const unit = model.getUnitById(result.unitId)
	unit.hp -= result.damageAmount
}

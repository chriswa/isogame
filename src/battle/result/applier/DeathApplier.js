export default function updateModel(model, result) {
	delete model.units[result.unitId]
}

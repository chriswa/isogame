export default function updateModel(model, result) {
	if (result.clear) {
		model.data.turn = {}
	}
	if (result.activeUnitId) {
		model.turn.activeUnitId = result.activeUnitId
	}
	if (result.stage) {
		model.turn.stage = result.stage
	}
}

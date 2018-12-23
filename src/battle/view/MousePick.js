export default class MousePick {
	constructor(tileCoords, unitId, tileCoordsBehindUnit, screenPos) {
		this.tileCoords = tileCoords
		this.unitId = unitId >= 0 ? unitId : undefined // ignore negative pickIds (e.g. shrub obstructions)
		this.tileCoordsBehindUnit = tileCoordsBehindUnit
		this.screenPos = screenPos
		this.magnifierEnabled = false
	}
	getTileCoords(ignoreUnitPicking = false) {
		return ignoreUnitPicking ? this.tileCoordsBehindUnit : this.tileCoords
	}
	getUnitId() {
		return this.unitId 
	}
	hasUnit() {
		return this.unitId !== undefined
	}
	hasTileCoords(ignoreUnitPicking = false) {
		return !!(this.getTileCoords(ignoreUnitPicking))
	}
	getScreenPos() {
		return this.screenPos
	}
}

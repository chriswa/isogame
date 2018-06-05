import * as camera from '../gfx/camera.js'
import BillboardGroup from '../gfx/BillboardGroup.js'
import SpriteData from '../../assets/sprites.js'
import FieldView from './field/FieldView.js' // imported for type hinting
import * as input from '../util/input.js'
import * as TextTexture from '../gfx/TextTexture.js'
import BattleModel from './BattleModel.js'
import * as cameraTweener from '../gfx/cameraTweener.js'
import TerrainTypes from './field/TerrainTypes.js'
import Sprite from './../gfx/Sprite.js'
import BattleGUI from '../gui/battle/BattleGUI.js'

class MousePick {
	constructor(tileCoords, unitId, tileCoordsBehindUnit, screenPos) {
		this.tileCoords = tileCoords
		this.unitId = unitId >= 0 ? unitId : undefined // ignore negative pickIds (e.g. shrub obstructions)
		this.tileCoordsBehindUnit = tileCoordsBehindUnit
		this.screenPos = screenPos
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

export default class BattleView {

	constructor(fieldView, battleModel) {
		this.tt = 0

		/** @type FieldView */
		this.fieldView = fieldView
		/** @type BattleModel */
		this.model = battleModel

		this.bbgroup = new BillboardGroup("assets/sprites.png", 1000, SpriteData)

		// create sprite for bouncing turn indicator
		this.indicatorBillboard = this.bbgroup.acquire()
		this.indicatorBillboard.setSpriteName('drop_indicator')
		this.indicatorBillboard.setGlow(1)
		this.indicatorBillboardBaseHeight = 0

		// create sprites for each unit
		this.unitSprites = {}
		for (let unitId in this.model.units) {
			const unitModel = this.model.units[unitId]
			const unitBillboard = this.bbgroup.acquire()
			unitBillboard.pickId = parseInt(unitId)

			const unitSprite = new Sprite(unitBillboard, unitModel.spriteSet, unitModel.facing)
			const tileData = this.fieldView.tileData[this.fieldView.size * unitModel.pos[1] + unitModel.pos[0]]
			unitSprite.setPosition([unitModel.pos[0], tileData.y, unitModel.pos[1]])
			unitSprite.startAnimation('IDLE')
			this.unitSprites[unitId] = unitSprite
		}

		// create billboards for field obstructions
		this.obstructionBillboards = []
		for (let tz = 0; tz < this.fieldView.size; tz += 1) {
			for (let tx = 0; tx < this.fieldView.size; tx += 1) {
				const terrainTypeId = this.fieldView.getTileAtCoords([tx, tz]).terrainTypeId
				const terrainType = TerrainTypes[terrainTypeId]
				if (terrainType.spriteName) {
					const billboard = this.bbgroup.acquire()
					billboard.pickId = -1
					const tileData = this.fieldView.tileData[this.fieldView.size * tz + tx]
					billboard.setPosition([tx, tileData.y, tz])
					const facing = Math.floor(Math.random() * 4) // FIXME: shouldn't be random!... should obstructionBillboards be owned by FieldView instead?!
					this.obstructionBillboards.push([billboard, terrainType, facing])
				}
			}
		}
	}

	getYForTileCenter([x, z]) {
		const tileData = this.fieldView.tileData[this.fieldView.size * z + x]
		return tileData.y
	}
	getWorldCoordsForTileCenter([x, z], dy = 0) {
		const y = this.getYForTileCenter([x, z]) + dy
		return [x, y, z]
	}

	setTopText(text) {
		BattleGUI.setTopText(text)
	}

	showActiveUnitIndicator(unitId) {
		if (unitId === undefined) { return }
		const unit = this.model.getUnitById(unitId)
		const worldPos = this.getWorldCoordsForTileCenter(unit.pos, -2.2)
		this.indicatorBillboard.setPosition(worldPos)
		this.indicatorBillboardBaseHeight = worldPos[1]
		this.indicatorBillboard.show()
	}
	hideActiveUnitIndicator() {
		this.indicatorBillboard.hide()
	}
	centerOnUnitId(unitId) {
		const unit = this.model.getUnitById(unitId)
		this.centerOnPos(this.getWorldCoordsForTileCenter(unit.pos))
	}
	centerOnPos(pos) {
		cameraTweener.setTargetCenter(pos)
	}
	lerpCameraToPos(pos) {
		cameraTweener.lerpToPos(pos)
	}

	setWaiting(isWaiting) { } // called by BattleController to show that we're waiting for a response from the server
	
	mousePick(allowUnits = true) {
		const screenPos = input.latestMousePos

		const isScreenPosCaptured = input.isScreenPosCaptured(screenPos)
		if (isScreenPosCaptured) {
			return new MousePick(undefined, Infinity, undefined, screenPos)
		}

		const { origin, direction } = camera.getRayFromScreenPos(screenPos)
		let [pickedTileCoords, tileDistance] = this.fieldView.rayPick(origin, direction)
		const pickedTileCoordsBehindUnit = pickedTileCoords // callers can use this to ignore unit picking
		let pickedUnitId, unitDistance
		if (allowUnits) {
			[pickedUnitId, unitDistance] = this.bbgroup.screenPick(screenPos)
			// if both tile and unit are picked, choose only the closest, setting the other to undefined
			//console.log(tileDistance, unitDistance)
			if (pickedTileCoords && pickedUnitId !== undefined) {
				//if (tileDistance < unitDistance) { // FIXME: these scalars don't compare properly!
				//	pickedUnitId = undefined
				//}
				//else {
					pickedTileCoords = undefined
				//}
			}
		}
		return new MousePick(pickedTileCoords, pickedUnitId, pickedTileCoordsBehindUnit, screenPos)
	}

	updateUnitGlows(callback) {
		for (let unitIdStr in this.unitSprites) {
			const unitSprite = this.unitSprites[unitIdStr]
			const unitId = parseInt(unitIdStr)
			const glowValue = callback(unitId)
			unitSprite.setGlow(glowValue)
		}
	}


	update(dt) {
		this.tt += dt

		const directions = ['n', 'e', 's', 'w']
		
		// unit sprites should be updated now (before mouseover picking is done)
		for (let unitId in this.model.units) {
			const unitModel = this.model.units[unitId]
			const unitSprite = this.unitSprites[unitId]
			
			unitSprite.update(dt, camera.getFacing(0))
		}

		for (let [billboard, terrainType, facing] of this.obstructionBillboards) {
			const spriteName = terrainType.spriteName + (terrainType.hasFacing ? ('-' + directions[camera.getFacing(facing)]) : '')
			billboard.setSpriteName(spriteName)
		}

		const indicatorPos = this.indicatorBillboard.getPosition()
		const bouncesPerSecond = 2
		indicatorPos[1] = this.indicatorBillboardBaseHeight - Math.abs(Math.sin(bouncesPerSecond * this.tt / 1000 * Math.PI * 2 / 2))
		this.indicatorBillboard.setPosition(indicatorPos)
	}

	render() {
		const viewProjectionMatrix = camera.getViewProjectionMatrix()
		this.fieldView.render(viewProjectionMatrix)
		this.bbgroup.render(viewProjectionMatrix, this.tt)
	}
	
}

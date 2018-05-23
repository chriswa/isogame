import * as camera from '../gfx/camera.js'
import BillboardGroup from '../gfx/BillboardGroup.js'
import SpriteData from '../../assets/sprites.js'
import FieldView from './field/FieldView.js' // imported for type hinting
import * as input from '../util/input.js'
import * as TextTexture from '../gfx/TextTexture.js'
import BattleModel from './BattleModel.js'
import * as cameraTweener from '../gfx/cameraTweener.js'
import TerrainTypes from './field/TerrainTypes.js'

const topTextElement = document.getElementById('topText')

export default class BattleView {

	constructor(fieldView, battleModel) {
		this.tt = 0

		/** @type FieldView */
		this.fieldView = fieldView
		/** @type BattleModel */
		this.battleModel = battleModel

		this.bbgroup = new BillboardGroup("assets/sprites.png", 1000, SpriteData)

		// create sprite for bouncing turn indicator
		this.indicatorBillboard = this.bbgroup.acquire()
		this.indicatorBillboard.setSpriteName('drop_indicator')
		this.indicatorBillboard.setGlow(1)

		// create billboards for each unit
		this.unitBillboards = {}
		for (let unitId in this.battleModel.units) {
			const unitModel = this.battleModel.units[unitId]
			const unitBillboard = this.bbgroup.acquire()
			unitBillboard.pickId = parseInt(unitId)
			const tileData = this.fieldView.tileData[this.fieldView.size * unitModel.z + unitModel.x]
			unitBillboard.setPosition([unitModel.x, tileData.y, unitModel.z])
			this.unitBillboards[unitId] = unitBillboard
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

	getYForTileCenter(x, z) {
		const tileData = this.fieldView.tileData[this.fieldView.size * z + x]
		return tileData.y
	}

	setTopText(message) {
		topTextElement.innerText = message
	}

	showActiveUnitIndicator(unitId) {
		const unit = this.battleModel.getUnitById(unitId)
		this.indicatorBillboardBaseHeight = this.getYForTileCenter(unit.x, unit.z) - 2.2
		this.indicatorBillboard.setPosition(twgl.v3.create(unit.x, this.indicatorBillboardBaseHeight, unit.z))
		this.indicatorBillboard.show()
	}
	hideActiveUnitIndicator() {
		this.indicatorBillboard.hide()
	}
	centerOnUnit(unitId) {
		const unit = this.battleModel.getUnitById(unitId)
		const y = this.getYForTileCenter(unit.x, unit.z)
		cameraTweener.setTargetCenter([unit.x, y, unit.z])
	}

	selectUnit(unitId) { // called by UITargetState
		this.centerOnUnit(unitId)
		//TODO: init unitPanel to display selected unit's stats and abilities
	}
	selectAbility(abilityId) { } // called by UITargetState
	setWaiting(isWaiting) { } // called by BattleController to show that we're waiting for a response from the server
	
	mousePick(allowUnits = true) {
		const screenPos = input.latestMousePos
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
		return [pickedTileCoords, pickedUnitId, pickedTileCoordsBehindUnit ]
	}

	updateUnitGlows(callback) {
		for (let unitIdStr in this.unitBillboards) {
			const unitBillboard = this.unitBillboards[unitIdStr]
			const unitId = parseInt(unitIdStr)
			const glowValue = callback(unitId)
			unitBillboard.setGlow(glowValue)
		}
	}

	update(dt) {
		this.tt += dt

		const directions = ['n', 'e', 's', 'w']
		
		// billboard sprites should be updated now (before mouseover picking is done)
		for (let unitId in this.battleModel.units) {
			const unitModel = this.battleModel.units[unitId]
			const unitBillboard = this.unitBillboards[unitId]
			
			unitBillboard.setSpriteName(unitModel.spriteSet + '-idle-' + directions[camera.getFacing(unitModel.facing)])
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

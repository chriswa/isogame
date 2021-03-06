import * as camera from '../../gfx/camera.js'
import BillboardGroup from '../../gfx/BillboardGroup.js'
import SpriteData from '../../../assets/sprites.js'
import FieldView from './FieldView.js' // imported for type hinting
import * as input from '../../util/input.js'
import * as TextTexture from '../../gfx/TextTexture.js'
import BattleModel from '../BattleModel.js'
import * as cameraTweener from '../../gfx/cameraTweener.js'
import TerrainTypes from '../TerrainTypes.js'
import Sprite from '../../gfx/Sprite.js'
import BattleGUI from '../../gui/battle/BattleGUI.js'
import billboardGlowOptions from '../../gfx/billboardGlowOptions.js'
import * as magnifier from '../../gfx/magnifier.js'
import MousePick from './MousePick.js'
import FloatingIndicator from './FloatingIndicator.js'

export default class BattleView {

	constructor(fieldView, battleModel) {
		this.tt = 0

		/** @type FieldView */
		this.fieldView = fieldView
		/** @type BattleModel */
		this.model = battleModel

		this.bbgroup = new BillboardGroup("assets/sprites.png", SpriteData)

		// create sprite for bouncing turn indicator
		this.turnIndicator = new FloatingIndicator(this.bbgroup.acquire())

		// create sprites for each unit
		/** @type Object.<string, Sprite> */
		this.unitSprites = {}
		for (let unitId in this.model.units) {
			const unitModel = this.model.units[unitId]
			const unitBillboard = this.bbgroup.acquire()
			unitBillboard.pickId = unitId

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

	// Tile Queries
	// ============

	getYForTileCenter([x, z]) {
		const tileData = this.fieldView.tileData[this.fieldView.size * z + x]
		return tileData.y
	}
	getWorldCoordsForTileCenter([x, z], dy = 0) {
		const y = this.getYForTileCenter([x, z]) + dy
		return [x, y, z]
	}

	// Unit Sprites
	// ============

	removeUnitSprite(unitId) {
		const unitSprite = this.unitSprites[unitId]
		this.bbgroup.release(unitSprite.billboard)
		delete this.unitSprites[unitId]
	}
	resetUnitGlows() {
		this.updateUnitGlows(unitId => { return billboardGlowOptions.NONE })
	}
	updateUnitGlows(callback) {
		for (let unitId in this.unitSprites) {
			const unitSprite = this.unitSprites[unitId]
			const glowValue = callback(unitId)
			unitSprite.setGlow(glowValue)
		}
	}

	// Misc GUI
	// ========

	setWaiting(isWaiting) { } // called by BattleController to show that we're waiting for a response from the server
	setTopText(text) {
		BattleGUI.setTopText(text)
	}
	showActiveUnitIndicator(unitId) {
		if (unitId === undefined) { return }
		const unit = this.model.getUnitById(unitId)
		const worldPos = this.getWorldCoordsForTileCenter(unit.pos, -2.2)
		this.turnIndicator.showAtWorldPos(worldPos)
	}
	hideActiveUnitIndicator() {
		this.turnIndicator.hide()
	}

	// Camera and Mouse
	// ================

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
	mousePick(canPickUnits = true) {
		const screenPos = input.latestMousePos

		// if the mouse is "captured" by a GUI element above the canvas, don't do a mouse pick
		const isScreenPosCaptured = input.isScreenPosCaptured(screenPos)
		if (isScreenPosCaptured) {
			return new MousePick(undefined, Infinity, undefined, screenPos)
		}

		// if the user is currently dragging (any mouse button or a multi-finger gesture), don't do a mouse pick
		if (input.isDraggingAnyButton() || input.isMultiGestureActive()) {
			return new MousePick(undefined, Infinity, undefined, screenPos)
		}

		const { origin, direction } = camera.getRayFromScreenPos(screenPos)
		let [pickedTileCoords, tileDistance] = this.fieldView.rayPick(origin, direction)
		const pickedTileCoordsBehindUnit = pickedTileCoords // callers can use this to ignore unit picking
		let pickedUnitId, unitDistance
		if (canPickUnits) {
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

	// Update and Render
	// =================

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

		this.turnIndicator.update(this.tt)
	}

	render() {
		const viewProjectionMatrix = camera.getViewProjectionMatrix()
		this.fieldView.render(viewProjectionMatrix)
		this.bbgroup.render(viewProjectionMatrix, this.tt)
		if (this.magnifierEnabled && input.isTouchActive()) {
			magnifier.render()
		}
		else {
			magnifier.hide()
		}
	}
	
}

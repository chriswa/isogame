import * as camera from '../gfx/camera.js'
import BillboardGroup from '../gfx/BillboardGroup.js'
import SpriteData from '../../assets/sprites.js'
import FieldView from './field/FieldView.js' // imported for type hinting
import * as input from '../util/input.js'
import * as TextTexture from '../gfx/TextTexture.js'
import BattleModel from './BattleModel.js'
import * as cameraTweener from '../gfx/cameraTweener.js'

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
		this.indicatorSprite = this.bbgroup.acquire()
		this.indicatorSprite.setSpriteName('drop_indicator')

		// create sprites for each unit
		this.unitSprites = {}
		for (let unitId in this.battleModel.units) {
			const unitModel = this.battleModel.units[unitId]
			const unitSprite = this.bbgroup.acquire()
			unitSprite.pickId = parseInt(unitId)
			const tileData = this.fieldView.tileData[this.fieldView.size * unitModel.z + unitModel.x]
			unitSprite.setPosition(twgl.v3.create(unitModel.x, tileData.y, unitModel.z))
			this.unitSprites[unitId] = unitSprite
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
		this.indicatorSpriteBaseHeight = this.getYForTileCenter(unit.x, unit.z) - 2.2
		this.indicatorSprite.setPosition(twgl.v3.create(unit.x, this.indicatorSpriteBaseHeight, unit.z))
		this.indicatorSprite.show()
	}
	hideActiveUnitIndicator() {
		this.indicatorSprite.hide()
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
	
	mousePick() {
		const screenPos = input.latestMousePos
		const { origin, direction } = camera.getRayFromScreenPos(screenPos)
		let [pickedTileCoords, tileDistance] = this.fieldView.rayPick(origin, direction)
		let [pickedUnitId, unitDistance] = this.bbgroup.screenPick(screenPos)
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
		return [ pickedTileCoords, pickedUnitId ]
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

		// billboard sprites should be updated now (before mouseover picking is done)
		for (let unitId in this.battleModel.units) {
			const unitModel = this.battleModel.units[unitId]
			const unitSprite = this.unitSprites[unitId]
			
			const directions = ['n', 'e', 's', 'w']
			unitSprite.setSpriteName(unitModel.spriteSet + '-idle-' + directions[camera.getFacing(unitModel.facing)])
		}

		const indicatorPos = this.indicatorSprite.getPosition()
		const bouncesPerSecond = 2
		indicatorPos[1] = this.indicatorSpriteBaseHeight - Math.abs(Math.sin(bouncesPerSecond * this.tt / 1000 * Math.PI * 2 / 2))
		this.indicatorSprite.setPosition(indicatorPos)
	}

	render() {
		const viewProjectionMatrix = camera.getViewProjectionMatrix()
		this.fieldView.render(viewProjectionMatrix)
		this.bbgroup.render(viewProjectionMatrix, this.tt)
	}
	
}

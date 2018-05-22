import * as camera from '../gfx/camera.js'
import BillboardGroup from '../gfx/BillboardGroup.js'
import SpriteData from '../../assets/sprites.js'
import FieldView from './field/FieldView.js' // imported for type hinting
import * as input from '../util/input.js'
import * as TextTexture from '../gfx/TextTexture.js'

export default class BattleView {

	constructor(fieldView, battleModel) {
		this.tt = 0

		/** @type FieldView */
		this.fieldView = fieldView
		this.battleModel = battleModel

		this.bbgroup = new BillboardGroup("assets/sprites.png", 1000, SpriteData)

		this.unitSprites = {}
		for (let unitId in this.battleModel.units) {
			const unitModel = this.battleModel.units[unitId]
			const unitSprite = this.bbgroup.acquire()
			unitSprite.pickId = parseInt(unitId)
			unitSprite.x = unitModel.x
			unitSprite.y = unitModel.y
			const tileData = this.fieldView.tileData[this.fieldView.size * unitSprite.y + unitSprite.x]
			unitSprite.setPosition(twgl.v3.create(unitSprite.x + .5, tileData.midHeight, unitSprite.y + .5))
			unitSprite.setGlow(1.0)
			this.unitSprites[unitId] = unitSprite
		}

	}

	selectUnit(unitId) { } // called by UITargetState
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
			if (tileDistance < unitDistance) { // FIXME: these scalars don't compare properly!
				pickedUnitId = undefined
			}
			else {
				pickedTileCoords = undefined
			}
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
	}

	render() {
		// billboard glow should be updated now (now that mouseover picking is done)
		//const glowFract = (Math.sin(this.tt / 80) / 2 + 0.5)
		//if (glowFract >= 1) { glowFract = 0.99999999 }
		//for (let unitId in this.battleModel.units) {
		//	const unitSprite = this.unitSprites[unitId]
		//	unitSprite.setGlow(1 + glowFract)
		//}

		const viewProjectionMatrix = camera.getViewProjectionMatrix()
		this.fieldView.render(viewProjectionMatrix)
		this.bbgroup.render(viewProjectionMatrix)
	}
	
}

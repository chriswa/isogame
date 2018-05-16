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

		this.bbgroup = new BillboardGroup("assets/sprites.png", 10, SpriteData)

		this.unitSprites = {}
		for (let unitId in this.battleModel.units) {
			const unitModel = this.battleModel.units[unitId]
			const unitSprite = this.bbgroup.acquire()
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
	mousePick(isUnitsIncluded = false) {
		const screenPos = input.mousePos
		const { origin, direction } = camera.getRayFromScreenPos(screenPos)
		let [ pickedTileCoords, tileDistance ] = this.fieldView.rayPick(origin, direction)
		// TODO: also pick from this.unitSprites
		let pickedUnitId = undefined
		if (isUnitsIncluded) {
			let unitDistance
			[ pickedUnitId, unitDistance ] = [ undefined, undefined ]
			if (pickedTileCoords && pickedUnitId !== undefined) {
				if (tileDistance < unitDistance) {
					pickedUnitId = undefined
				}
				else {
					pickedTileCoords = this.battleModel.getUnitCoordsById(pickedUnitId)
				}
			}
		}
		return [ pickedTileCoords, pickedUnitId ]
	}

	update(dt) {
		this.tt += dt

		// update sample billboard(s)
		const glowFract = (Math.sin(this.tt / 80) / 2 + 0.5)
		if (glowFract >= 1) { glowFract = 0.99999999 }
		for (let unitId in this.battleModel.units) {
			const unitModel = this.battleModel.units[unitId]
			const unitSprite = this.unitSprites[unitId]
			
			unitSprite.setGlow(1 + glowFract)
			const directions = ['n', 'e', 's', 'w']
			unitSprite.setSpriteName(unitModel.spriteSet + '-idle-' + directions[camera.getFacing(unitModel.facing)])
		}
	}

	render() {
		const worldViewProjectionMatrix = camera.getWorldViewProjectionMatrix()
		this.fieldView.render(worldViewProjectionMatrix)
		this.bbgroup.render(worldViewProjectionMatrix)
		return worldViewProjectionMatrix
	}
	
}

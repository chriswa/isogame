import * as input from '../util/input.js'
import * as camera from '../gfx/camera.js'
import * as cameraController from '../gfx/cameraController.js'
import BillboardGroup from '../gfx/BillboardGroup.js'
import SpriteData from '../../assets/sprites.js'
import { addRemovableEventListener } from '../util/domUtils.js'

export default class Battle {

	constructor(fieldView, battleModel) {
		this.tt = 0
		this.destroyCallbacks = []
		this.initEventHandlers()

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

	destroy() {
		this.destroyCallbacks.forEach(callback => { callback() })
	}

	initEventHandlers() {
		// on mouse wheel
		this.destroyCallbacks.push(addRemovableEventListener(document, 'wheel', e => {
			camera.setZoomExp(camera.getZoomExp() - e.deltaY / 100 / 10)
		}))
		// on mousedown
		this.destroyCallbacks.push(addRemovableEventListener(document, 'mousedown', e => {
			if (e.button === 1) { // middle mouse button
				cameraController.setTargetFacing((cameraController.getFacing() + 1) % 4)
			}
		}))
		// on "click"
		this.destroyCallbacks.push(addRemovableEventListener(document, 'click', e => {
			const { origin, direction } = camera.getRayFromMouse(input.mousePos)
			const tileCoords = this.fieldView.rayPick(origin, direction)
			if (tileCoords !== undefined) {
				const midHeight = this.fieldView.getTileAtCoords(tileCoords).midHeight
				cameraController.setTargetCenter([tileCoords[0] + 0.5, midHeight, tileCoords[1] + 0.5])
			}
		}))
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

		// sample mouse raypicking
		const { origin, direction } = camera.getRayFromMouse(input.mousePos)
		const tileCoords = this.fieldView.rayPick(origin, direction)
		this.fieldView.updateOverlay((tx, ty) => {
			if (!tileCoords) { return 0 }
			const dx = Math.abs(tileCoords[0] - tx)
			const dy = Math.abs(tileCoords[1] - ty)
			const manhattan = dx + dy
			return manhattan === 0 ? 3 : manhattan < 2 ? 2 : manhattan < 5 ? 1 : 0
		})

		cameraController.update(dt) // this must occur after anything which may update the cameraController
	}

	render() {
		const worldViewProjectionMatrix = camera.getWorldViewProjectionMatrix()
		this.fieldView.render(worldViewProjectionMatrix)
		this.bbgroup.render(worldViewProjectionMatrix)
	}
	
}

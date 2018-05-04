import * as input from '../util/input.js'
import * as camera from '../gfx/camera.js'
import * as cameraController from '../gfx/cameraController.js'
import * as fieldBuilder from './field/fieldBuilder.js'
import BillboardGroup from '../gfx/BillboardGroup.js'
import SpriteData from '../../assets/sprites.js'
import { addRemovableEventListener } from '../util/domUtils.js'

export default class Battle {

	constructor() {
		this.tt = 0
		this.destroyCallbacks = []

		// sample field
		this.field1 = fieldBuilder.build({ type: "randomwoods", seed: 123 })

		// sample billboard(s)
		this.bbgroup1 = new BillboardGroup("assets/sprites.png", 10, SpriteData)
		this.bb2 = this.bbgroup1.acquire()
		const x = 3
		const y = 0
		this.bb2.setPosition(twgl.v3.create(x + .5, this.field1.tileData[this.field1.size * y + x].midHeight, y + .5))
		this.bb2.setGlow(1.0)

		this.initEventHandlers()
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
			const tileCoords = this.field1.rayPick(origin, direction)
			if (tileCoords !== undefined) {
				const midHeight = this.field1.getTileAtCoords(tileCoords).midHeight
				cameraController.setTargetCenter([tileCoords[0] + 0.5, midHeight, tileCoords[1] + 0.5])
			}
		}))
	}

	update(dt) {
		this.tt += dt

		// update sample billboard(s)
		const glowFract = (Math.sin(this.tt / 80) / 2 + 0.5)
		if (glowFract >= 1) { glowFract = 0.99999999 }
		this.bb2.setGlow(1 + glowFract)
		const directions = ['n', 'e', 's', 'w']
		this.bb2.setSpriteName('goblin_blue-idle-' + directions[camera.getFacing(1)])

		// sample mouse raypicking
		const { origin, direction } = camera.getRayFromMouse(input.mousePos)
		const tileCoords = this.field1.rayPick(origin, direction)
		this.field1.updateOverlay((tx, ty) => {
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
		this.field1.render(worldViewProjectionMatrix)
		this.bbgroup1.render(worldViewProjectionMatrix)
	}
	
}

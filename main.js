import * as gfx from './gfx.js'
import * as camera from './camera.js'
import * as cameraController from './cameraController.js'
import * as input from './input.js'
import * as FieldGenerator from './field/FieldGenerator.js'
import BillboardGroup from './billboardGroup.js'
import SpriteData from './assets/sprites.js'

const gl = gfx.gl

// sample field
const field1 = FieldGenerator.generate()

// sample billboard(s)
const bbgroup1 = new BillboardGroup("assets/sprites.png", 10, SpriteData)
const bb2 = bbgroup1.acquire()
const x = 3
const y = 0
bb2.setPosition(twgl.v3.create(x + .5, field1.tileData[field1.size * y + x].midHeight, y + .5))
bb2.setGlow(1.0)

// sample camera control
document.addEventListener('wheel', e => {
	camera.setZoomExp( camera.getZoomExp() - e.deltaY / 100 / 10 )
})
document.addEventListener('mousedown', e => {
	if (e.button === 1) { // middle mouse button
		cameraController.setTargetFacing((cameraController.getFacing() + 1) % 4)
	}
})
document.addEventListener('click', e => {
	const { origin, direction } = camera.getRayFromMouse(input.mousePos)
	const tileCoords = field1.rayPick(origin, direction)
	if (tileCoords !== undefined) {
		const midHeight = field1.getTileAtCoords(tileCoords).midHeight
		cameraController.setTargetCenter([tileCoords[0] + 0.5, midHeight, tileCoords[1] + 0.5])
	}
})

// MAIN LOOP
// =========

let tt = 0
gfx.startLoop(dt => {
	tt += dt

	// UPDATE ALL THE THINGS
	// =====================

	// update sample billboard(s)
	const glowFract = (Math.sin(tt / 80) / 2 + 0.5)
	if (glowFract >= 1) { glowFract = 0.99999999 }
	bb2.setGlow(1 + glowFract)
	const directions = ['n', 'e', 's', 'w']
	bb2.setSpriteName('goblin_blue-idle-' + directions[ camera.getFacing(1) ])

	// sample mouse raypicking
	const { origin, direction } = camera.getRayFromMouse(input.mousePos)
	const tileCoords = field1.rayPick(origin, direction)
	field1.updateOverlay((tx, ty) => {
		if (!tileCoords) { return 0 }
		const dx = Math.abs(tileCoords[0] - tx)
		const dy = Math.abs(tileCoords[1] - ty)
		const manhattan = dx + dy
		return manhattan === 0 ? 3 : manhattan < 2 ? 2 : manhattan < 5 ? 1 : 0
	})

	// update camera
	cameraController.update(dt) // this must occur after anything which may update the cameraController

	// RENDER ALL THE THINGS
	// =====================
	gfx.clear()
	const worldViewProjectionMatrix = camera.getWorldViewProjectionMatrix()

	field1.render(worldViewProjectionMatrix)
	bbgroup1.render(worldViewProjectionMatrix)

})

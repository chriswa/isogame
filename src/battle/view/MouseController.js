import { EventSubscriber } from '../../util/domUtils.js'
import * as cameraTweener from '../../gfx/cameraTweener.js'
import * as input from '../../util/input.js'
import gl from '../../gfx/gl.js'
import * as camera from '../../gfx/camera.js'

const dragThreshold = 4 // pixels

export default class MouseController {
	constructor(view, onClickCallback) {
		this.view = view
		this.onClickCallback = onClickCallback

		this.inputLayer = {
			layerOrder: 10,
			dragThreshold: 4,
			onMouseDown(pos, button) {
				return true // capture all mousedown events for dragging (returning true means we will get onClick or onDrag(s) events)
			},
			onDrag(deltaPos, button) {
				if (button === 0) { // left mouse button
					// FIXME: use proper math instead of fudging stuff
					//const [xScale, yScale] = camera.getAspectScaleXY()
					const angle = cameraTweener.getRawFacing()
					const cx = (-Math.sin(angle) * deltaPos[1] + Math.cos(angle) * deltaPos[0]) / 16 // WHY SIXTEEN?
					const cz = (Math.sin(angle) * deltaPos[0] + Math.cos(angle) * deltaPos[1]) / 16 // WHY SIXTEEN?
					const scale = (1 / cameraTweener.getRawZoom()) / 40 // WHY FORTY?!
					cameraTweener.rawMoveCenter(cx * scale, 0, cz * scale)
				}
				else if (button === 1) { // middle mouse button
					camera.rotation[0] += -deltaPos[1] / 500
				}
				else if (button === 2) { // right mouse button
					camera.rotation[1] += deltaPos[0] / 200
				}
			},
			onDragStart(button) {
				if (button === 2) { // right mouse button
					cameraTweener.cancelFacingTween()
				}
			},
			onDragEnd(button) {
				if (button === 2) { // right mouse button
					const closestFacing = Math.floor(camera.rotation[1] / (Math.PI / 2)) % 4
					cameraTweener.setTargetFacing(-closestFacing, 'slow')
				}
			},
			onClick(pos, button) {
				if (button === 2) { // right mouse button
					cameraTweener.setTargetFacing((cameraTweener.getFacing() + 1) % 4, 'fast')
					camera.rotation[0] = Math.PI * -0.25 // reset any manual pitch rotation set by dragging middle mouse button
				}
				else if (button === 1) { // middle mouse button
					camera.rotation[0] = Math.PI * -0.25 // reset any manual pitch rotation set by dragging middle mouse button
				}
				else if (button === 0) { // left mouse button
					onClickCallback(pos)
				}
			},
			onWheel(pos, deltaY) {
				cameraTweener.setZoom(cameraTweener.getZoom() - deltaY / 100 / 10)
			},
		}
		input.addInputLayer(this.inputLayer)
	}
	update(dt) {
		cameraTweener.update(dt) // this must occur after anything which may update the cameraTweener
	}

	activate() {
		input.reenableInputLayer(this.inputLayer)
	}
	deactivate() {
		input.disableInputLayer(this.inputLayer)
	}
}
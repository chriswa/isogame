import { EventSubscriber } from '../util/domUtils.js'
import * as cameraTweener from '../gfx/cameraTweener.js'
import * as input from '../util/input.js'
import gl from '../gfx/gl.js'
import * as camera from '../gfx/camera.js'

const dragThreshold = 4 // pixels

export default class MouseController {
	constructor(view, onClickCallback) {
		this.view = view
		this.onClickCallback = onClickCallback

		this.active = false
		this.eventSubscriber = new EventSubscriber() // for easy unsubscribing

		this.dragStart = [0, 0]
		this.isDragging = false

		this.initEventHandlers()
	}
	initEventHandlers() {
		// on mouse wheel
		this.eventSubscriber.subscribe(document, 'wheel', e => {
			cameraTweener.setZoom(cameraTweener.getZoom() - e.deltaY / 100 / 10)
		})
		// on mousedown
		this.eventSubscriber.subscribe(document, 'mousedown', e => {
			if (e.button === 0) { // left mouse button
				this.dragStart[0] = e.clientX
				this.dragStart[1] = e.clientY
			}
			else if (e.button === 1) { // middle mouse button
				if (input.mouseButtons.left) { return } // don't allow rotation during drag, it's very confusing because the rotation origin is the centre of the screen 
				cameraTweener.setTargetFacing((cameraTweener.getFacing() + 1) % 4)
			}
		})
		// on mouseup
		this.eventSubscriber.subscribe(document, 'mouseup', e => {
			if (e.button === 0) { // left mouse button
				if (this.isDragging) {
					this.isDragging = false
					this.onDragComplete()
				}
				else {
					this.onClick()
				}
			}
		})
	}
	update(dt) {

		// check for start of drag
		if (input.mouseButtons.left && !this.isDragging) {
			const dx = input.mousePos[0] - this.dragStart[0]
			const dy = input.mousePos[1] - this.dragStart[1]
			if (Math.abs(dx) >= dragThreshold || Math.abs(dy) >= dragThreshold) {
				this.isDragging = true
			}
		}

		// on drag, move camera
		if (this.isDragging) {
			// FIXME: use proper math instead of fudging stuff
			//const [xScale, yScale] = camera.getAspectScaleXY()
			const dx = (input.mousePos[0] - this.dragStart[0]) * 1/16
			const dy = (input.mousePos[1] - this.dragStart[1]) * 1/16
			const angle = cameraTweener.getRawFacing()
			const cx = -Math.sin(angle) * dy + Math.cos(angle) * dx
			const cz = Math.sin(angle) * dx + Math.cos(angle) * dy
			const scale = ( 1 / cameraTweener.getRawZoom()) / 40 // WHY FORTY?!
			cameraTweener.rawMoveCenter(cx * scale, 0, cz * scale)
			// absorb movement!
			this.dragStart[0] = input.mousePos[0]
			this.dragStart[1] = input.mousePos[1]
		}

		cameraTweener.update(dt) // this must occur after anything which may update the cameraTweener
	}
	onDragComplete() {
		//console.log('drag complete')
	}
	onClick() {
		this.onClickCallback(input.mousePos)
	}
	activate() {
		this.active = true
	}
	deactivate() {
		this.active = false
	}
}
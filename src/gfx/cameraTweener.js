import * as camera from './camera.js'
import easings from '../util/easings.js'

const defaultEasing = easings.outCubic

class Tween {
	constructor({ onStep, onEnd, easing }) {
		this.onStep = onStep
		this.onEnd = onEnd
		this.easing = easing || defaultEasing
		this.active = false
		this.t = 0
		this.x0 = undefined
		this.dx = undefined
		this.x1 = undefined
		this.endValue = undefined
		this.durationMs = 1
	}
	start(x0, dx, x1, durationMs) {
		this.active = true
		this.t = 0
		this.x0 = x0
		this.dx = dx
		this.x1 = x1
		this.durationMs = durationMs
	}
	update(dt) {
		if (this.active) {
			this.t += dt / this.durationMs
			if (this.t < 1) {
				const t = this.easing(this.t)
				this.onStep(this.x0, this.dx, t)
			}
			else {
				this.active = false
				this.onEnd(this.x1)
			}
		}
	}
	halt() {
		this.active = false
	}
}


export function reset() {
	targetFacing = 0
	targetZoom = -4
	setCameraScaleFromZoom(targetZoom)
	targetCenter[0] = targetCenter[1] = targetCenter[2] = 0
	isPosLerping = false
}

// helper functions for facing

function angleMod(angle) {
	while (angle < 0) { angle += Math.PI * 2 }
	while (angle >= Math.PI * 2) { angle -= Math.PI * 2 }
	return angle
}
function facingToYaw(facing) {
	return angleMod(Math.PI * (facing * (-1 / 2) + (1 / 4)))
}
function shortestRotationToAngle(angle) {
	return angle <= Math.PI ? angle : angle - Math.PI * 2
}

// FACING
// ------

let targetFacing = 0

export function getFacing() {
	return targetFacing
}

export function getRawFacing() {
	return camera.rotation[1]
}

const yawTween = new Tween({
	easing: easings.outCubic,
	onStep(yawStart, yawDelta, t) {
		camera.rotation[1] = angleMod(yawStart + yawDelta * t)
	},
	onEnd(yawEnd) {
		camera.rotation[1] = yawEnd
	},
})

export function setTargetFacing(targetFacing_, speed = 'fast') {
	targetFacing = targetFacing_
	const yawStart = camera.rotation[1]
	const yawEnd = facingToYaw(targetFacing)
	const yawDelta = shortestRotationToAngle(angleMod(yawEnd - yawStart))
	const yawDurationPerTurn = 1600
	const yawDuration = Math.abs(yawDelta) / (Math.PI * 2) * yawDurationPerTurn + (speed === 'slow' ? 300 : 0)
	yawTween.start(yawStart, yawDelta, yawEnd, yawDuration)
}

export function cancelFacingTween() {
	yawTween.halt()
}


// ZOOM
// ----

let targetZoom = -4
let currentZoom
setCameraScaleFromZoom(targetZoom)

function setCameraScaleFromZoom(zoom) {
	currentZoom = zoom
	camera.setScale(Math.pow(2, zoom))
}

export function getZoom() {
	return targetZoom
}

export function getRawZoom() {
	return camera.getScale() // not exp!
}

const zoomTween = new Tween({
	easing: easings.outCubic,
	onStep(zoomStart, zoomDelta, t) {
		setCameraScaleFromZoom(zoomStart + zoomDelta * t)
	},
	onEnd(zoomEnd) {
		setCameraScaleFromZoom(zoomEnd)
	},
})

export function setZoom(targetZoom_) {
	targetZoom = targetZoom_
	const zoomStart = currentZoom
	const zoomEnd = targetZoom
	const zoomDelta = zoomEnd - zoomStart
	const zoomDuration = 200
	zoomTween.start(zoomStart, zoomDelta, zoomEnd, zoomDuration)
}


// POSITION
// --------

const targetCenter = twgl.v3.create()
let isPosLerping = false

// work vectors
const posStart = twgl.v3.create()
const posDelta = twgl.v3.create()
const zeroVector = twgl.v3.create()
const workV3 = twgl.v3.create()

export function rawMoveCenter(dx, dy, dz) {
	isPosLerping = false
	posTween.halt()
	camera.position[0] += dx
	camera.position[1] += dy
	camera.position[2] += dz
}

export function lerpToPos(pos) {
	posTween.halt()
	twgl.v3.negate(pos, targetCenter)
	isPosLerping = true
}

export function setTargetCenter(targetCenter_) {
	isPosLerping = false
	twgl.v3.negate(targetCenter_, targetCenter)
	twgl.v3.copy(camera.position, posStart)
	twgl.v3.subtract(targetCenter, posStart, posDelta) // set posDelta
	const distance = twgl.v3.distance(posDelta, zeroVector)
	const duration = Math.max(Math.min(distance * 25, 300), 100)
	posTween.start(posStart, posDelta, targetCenter, duration)
}

const posTween = new Tween({
	easing: easings.inOutQuad,
	onStep(posStart, posDelta, t) {
		twgl.v3.mulScalar(posDelta, t, workV3)
		twgl.v3.add(workV3, posStart, camera.position)
	},
	onEnd(posEnd) {
		twgl.v3.copy(posEnd, camera.position)
	},
})

function updatePosLerp(dt) {
	if (isPosLerping) {
		const t = 1 - Math.pow(0.5, dt / 100) // frame rate independent damping using lerp
		twgl.v3.lerp(camera.position, targetCenter, t, camera.position)
	}
}


// UPDATE
// ------

export function update(dt) {
	yawTween.update(dt)
	posTween.update(dt)
	zoomTween.update(dt)
	updatePosLerp(dt)
}

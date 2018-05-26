import billboardAnimations from './billboardAnimations.js'

const directions = ['n', 'e', 's', 'w']

export default class Sprite {
	constructor(billboard, spriteSetName, facing = 0) {
		this.billboard = billboard
		this.spriteSetName = spriteSetName
		this.facing = facing
		this.animationName = 'IDLE'
		this.animationTime = 0
		this.animationFrame = 0
		this.animationNeedsUpdate = true
		this.lastCameraFacing = undefined
	}
	setPosition(pos) {
		this.billboard.setPosition(pos)
	}
	setGlow(glow) {
		this.billboard.setGlow(glow)
	}
	setFacing(facing) {
		this.facing = facing
	}
	update(dt, cameraFacing) {
		this.animationTime += dt
		
		while (true) {
			const currentFrame = billboardAnimations[this.animationName][this.animationFrame]
			const currentFrameDuration = currentFrame.duration
			if (currentFrameDuration === undefined || this.animationTime < currentFrameDuration) {
				break
			}
			// advance to next frame
			this.animationTime -= currentFrameDuration
			this.animationNeedsUpdate = true
			this.animationFrame += 1
			if (this.animationFrame >= billboardAnimations[this.animationName].length) {
				this.animationFrame = 0
			}
		}

		const effectiveFacing = (this.facing + cameraFacing) % 4

		if (effectiveFacing !== this.lastCameraFacing) {
			this.lastCameraFacing = effectiveFacing
			this.animationNeedsUpdate = true
		}

		if (this.animationNeedsUpdate) {
			const currentFrameName = billboardAnimations[this.animationName][this.animationFrame].frameName
			const facingName = directions[effectiveFacing]
			const spriteName = this.spriteSetName + '-' + currentFrameName + '-' + facingName
			this.billboard.setSpriteName(spriteName)
			this.animationNeedsUpdate = false
		}
	}
	startAnimation(animationName, animationTime = 0) {
		this.animationName = animationName
		this.animationFrame = 0
		this.animationTime = animationTime
		this.animationNeedsUpdate = true
	}
	playAnimation(animationName) {
		if (animationName !== this.animationName) {
			this.startAnimation(animationName)
		}
	}

}

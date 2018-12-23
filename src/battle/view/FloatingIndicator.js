export default class FloatingIndicator {
	constructor(billboard) {
		this.billboard = billboard
		this.billboard.setSpriteName('drop_indicator')
		this.billboard.setGlow(1)
		this.yOffset = 0
	}
	showAtWorldPos(worldPos) {
		this.billboard.setPosition(worldPos)
		this.yOffset = worldPos[1]
		this.billboard.show()
	}
	hide() {
		this.billboard.hide()
	}

	update(tt) {
		const indicatorPos = this.billboard.getPosition()
		const bouncesPerSecond = 2
		indicatorPos[1] = this.yOffset - Math.abs(Math.sin(bouncesPerSecond * tt / 1000 * Math.PI * 2 / 2))
		this.billboard.setPosition(indicatorPos)
	}
}

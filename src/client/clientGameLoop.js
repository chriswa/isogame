import * as input from '../util/input.js'
import * as gfx from '../gfx/gfx.js'
import * as debugCanvas from '../gfx/debugCanvas.js'

export function start(updateCallback, renderCallback) {

	gfx.startLoop(dt => {

		// wipe the debugCanvas first, so that other code can draw to it at will
		debugCanvas.clear()

		// process queued input events first: for accurate mouse picks, this is done before moving the camera or advancing sprite animations
		input.update()

		// update
		updateCallback(dt)

		// render
		gfx.clear()
		renderCallback()
	})

}

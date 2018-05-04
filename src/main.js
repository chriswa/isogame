import * as gfx from './gfx.js'
import * as battle from './battle.js'

const battle1 = battle.generate()

gfx.startLoop(dt => {

	// update
	battle1.update(dt)

	// render
	gfx.clear()
	battle1.render()

})

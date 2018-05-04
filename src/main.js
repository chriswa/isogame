import * as gfx from './gfx/gfx.js'
import * as battleBuilder from './battle/battleBuilder.js'

const battle1 = battleBuilder.build()

gfx.startLoop(dt => {

	// update
	battle1.update(dt)

	// render
	gfx.clear()
	battle1.render()

})

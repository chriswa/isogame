import * as gfx from './gfx/gfx.js'
import * as battleBuilder from './battle/battleBuilder.js'

const battleState = battleBuilder.build()

gfx.startLoop(dt => {

	// update
	battleState.update(dt)

	// render
	gfx.clear()
	battleState.render()

})

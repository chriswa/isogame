import Turn from './result/TurnResult.js'
import Victory from './result/VictoryResult.js'

import Spellcast from './result/SpellcastResult.js'
import Walk from './result/WalkResult.js'
import Face from './result/FaceResult.js'

import Hurt from './result/HurtResult.js'
import Death from './result/DeathResult.js'

const classes = {
	Turn,
	Victory,

	Spellcast,
	Walk,
	Face,

	Hurt,
	Death,
}

export default function (resultData, model) {
	const cls = classes[resultData.type]
	const obj = new cls(model, resultData)
	return obj
}

import Walk from './ability/WalkAbility.js'
import Melee from './ability/MeleeAbility.js'
import Fireball from './ability/FireballAbility.js'
import Face from './ability/FaceAbility.js'

const classes = {
	Walk,
	Melee,
	Fireball,
	Face,
}

export default function (abilityType, ...args) {
	const cls = classes[abilityType]
	const obj = new cls(...args)
	return obj
}

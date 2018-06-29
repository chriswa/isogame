import Walk from './targeting/WalkTargeting.js'
import Face from './targeting/FaceTargeting.js'
import AOE from './targeting/AOETargeting.js'

const classes = {
	Walk,
	Face,
	AOE,
}

export default function (targetingControllerType, ...args) {
	const cls = classes[targetingControllerType]
	const obj = new cls(...args)
	return obj
}

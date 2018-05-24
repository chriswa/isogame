const Animations = {
	STAND: [
		{ frameName: 'idle', duration: undefined, },
	],
	CAST: [
		{ frameName: 'cast', duration: undefined, },
	],
	ACT: [
		{ frameName: 'act', duration: undefined, },
	],
	IDLE: [
		{ frameName: 'idle', duration: 250, },
		{ frameName: 'walk1', duration: 250, },
		{ frameName: 'idle', duration: 250, },
		{ frameName: 'walk2', duration: 250, },
	],
	WALK: [
		{ frameName: 'idle', duration: 150, },
		{ frameName: 'walk1', duration: 150, },
		{ frameName: 'idle', duration: 150, },
		{ frameName: 'walk2', duration: 150, },
	],
}

export default Animations

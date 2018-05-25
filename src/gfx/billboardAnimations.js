const billboardAnimations = {
	STAND: [
		{ frameName: 'idle', duration: undefined, },
	],
	CAST: [
		//{ frameName: 'cast', duration: undefined, },
		{ frameName: 'cast', duration: 150, },
		{ frameName: 'idle', duration: 150, },
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
		{ frameName: 'idle', duration: 100, },
		{ frameName: 'walk1', duration: 100, },
		{ frameName: 'idle', duration: 100, },
		{ frameName: 'walk2', duration: 100, },
	],
}

export default billboardAnimations

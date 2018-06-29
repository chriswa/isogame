const def = {
	VOID: { },
	DIRT: { walkCost: 1, }, // if there's no walkCost, the terrain cannot be walked upon
	BUSH: { spriteName: 'bush', },
	DEADBUSH: { spriteName: 'deadbush', },
	BIGTREE: { spriteName: 'bigtree', },
	SMALLTREE: { spriteName: 'smalltree', },
	LEAFYBUSH: { spriteName: 'leafybush', },
	ROCK1: { spriteName: 'rock1', },
	ROCK2: { spriteName: 'rock2', },
	STICK: { spriteName: 'stick', hasFacing: true, }, // hasFacing will append '-n', '-e', etc
}

export default def
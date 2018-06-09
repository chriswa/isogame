const def = {
	VOID: { },
	DIRT: { walkCost: 1, }, // if there's no walkCost, the terrain cannot be walked upon
	BUSH: { spriteName: 'bush', },
	STICK: { obstructWalking: true, spriteName: 'stick', hasFacing: true, }, // hasFacing will append '-n', '-e', etc
}

export default def
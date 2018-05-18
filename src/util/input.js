export const mousePos = twgl.v3.create()

document.addEventListener('mousemove', e => {
	mousePos[0] = e.clientX
	mousePos[1] = e.clientY
})

export const mouseButtons = {
	left: false,
	right: false,
	middle: false,
}

document.addEventListener('mousedown', e => {
	if (e.button === 0) { mouseButtons.left = true }
	else if (e.button === 1) { mouseButtons.middle = true }
	else if (e.button === 2) { mouseButtons.right = true }
})

document.addEventListener('mouseup', e => {
	if (e.button === 0) { mouseButtons.left = false }
	else if (e.button === 1) { mouseButtons.middle = false }
	else if (e.button === 2) { mouseButtons.right = false }
})


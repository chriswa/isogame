export const mousePos = twgl.v3.create()

document.addEventListener("mousemove", e => {
	mousePos[0] = e.clientX
	mousePos[1] = e.clientY
})


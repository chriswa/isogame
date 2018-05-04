/** @type { HTMLCanvasElement } */
const canvas = document.getElementById('mainCanvas')

/** @type { WebGLRenderingContext } */
const gl = canvas.getContext('webgl', {
	antialias: false,
})

if (!gl) {
	alert(`Sorry!\n\nYour browser does not support WebGL.\n\nTry Chrome?`)
}

//console.warn("gl.CULL_FACE is disabled for testing!")
gl.enable(gl.CULL_FACE)
gl.enable(gl.DEPTH_TEST)

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

export default gl

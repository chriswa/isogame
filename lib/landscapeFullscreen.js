const styleEl = document.createElement('style')
document.head.appendChild(styleEl)
const styleSheet = styleEl.sheet
function addCssRule(str) {
	styleSheet.insertRule(str, styleSheet.cssRules.length)
}

function htmlToDom(html) {
	return document.createRange().createContextualFragment(html)
}

addCssRule(`
	.landscapeFullscreenOverlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.8);
		align-items: center;
		justify-content: center;
	}
`)

addCssRule(`
	#pleaseRotate {
		display: none;
	}
`)

addCssRule(`
	@media only screen and (max-width: 640px) {
		#pleaseRotate {
			display: flex;
		}
	}
`)

const pleaseRotateDiv = htmlToDom(`
	<div id="pleaseRotate" class="landscapeFullscreenOverlay">
		<div style="text-align: center;">
			<img src="assets/pleaseRotate.png">
			<br>
			<br>
			<p style="color: white; font-size: 32px;">Please rotate your device</p>
		</div>
	</div>
`)
document.body.appendChild(pleaseRotateDiv)


const isIOS = /iPhone/i.test(navigator.userAgent) || /iPad/i.test(navigator.userAgent)
if (!isIOS) {

	addCssRule(`
		#pleaseFullscreen {
			display: none;
		}
	`)

	addCssRule(`
		@media only screen and (max-height: 480px) and (display-mode: browser) {
			#pleaseFullscreen {
				display: flex;
			}
		}
	`)

	let pleaseFullscreen = htmlToDom(`
		<div id="pleaseFullscreen" class="landscapeFullscreenOverlay">
			<div style="text-align: center;">
				<img src="assets/pleaseFullscreen.png">
				<br>
				<br>
				<p style="color: white; font-size: 32px;">Please tap for fullscreen</p>
			</div>
		</div>
	`)
	document.body.appendChild(pleaseFullscreen)
	pleaseFullscreen = document.getElementById('pleaseFullscreen')

	pleaseFullscreen.addEventListener('click', () => {
		const el = document.documentElement
		if (el.requestFullscreen) {
			el.requestFullscreen()
		}
		else if (el.webkitRequestFullscreen) {
			el.webkitRequestFullscreen()
		}
		else if (el.mozRequestFullScreen) {
			el.mozRequestFullScreen()
		}
	})

	document.addEventListener('fullscreenchange', onFullscreenChange)
	document.addEventListener('webkitfullscreenchange', onFullscreenChange)
	document.addEventListener('mozfullscreenchange', onFullscreenChange)
	function onFullscreenChange() {
		const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement)
		if (isFullscreen) {
			document.body.removeChild(pleaseFullscreen)
		}
		else {
			document.body.appendChild(pleaseFullscreen)
		}
	}

}
// IOS
else {

	// TODO: experiment with a "pleaseScrollDown" overlay, with all scroll events blocked afterward (like how canvas events currently work)

	/*

	addCssRule(`
		#pleaseAddIOS {
			display: none;
		}
	`)

	addCssRule(`
		@media only screen and (max-height: 480px) and (display-mode: browser) {
			#pleaseAddIOS {
				display: flex;
			}
		}
	`)

	let pleaseAddIOS = htmlToDom(`
		<div id="pleaseAddIOS" class="landscapeFullscreenOverlay">
			<div style="text-align: center;">
				<p style="color: white; font-size: 32px;">For fullscreen on IOS</p>
				<br>
				<br>
				<img src="assets/pleaseAddIOS.png">
				<br>
				<br>
				<br>
				<p style="color: white; font-size: 32px;">Click to dismiss</p>
			</div>
		</div>
	`)
	document.body.appendChild(pleaseAddIOS)

	pleaseAddIOS = document.getElementById('pleaseAddIOS')

	pleaseAddIOS.addEventListener('click', () => {
		document.body.removeChild(pleaseAddIOS)
	})

	*/
}


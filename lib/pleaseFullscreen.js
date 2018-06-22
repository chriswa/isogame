const styleEl = document.createElement('style')
document.head.appendChild(styleEl)
const styleSheet = styleEl.sheet
function addCssRule(str) {
	styleSheet.insertRule(str, styleSheet.cssRules.length)
}

function htmlToFrag(html) {
	return document.createRange().createContextualFragment(html.trim())
}

function addFragToBodyAndReturnNode(frag) {
	document.body.appendChild(frag)
	return document.body.lastChild
}

//addCssRule(`
//	#pleaseFullscreenDebug {
//		position: absolute;
//		top: 0;
//		left: 0;
//		z-index: 1;
//		color: pink;
//	}
//`)
//const pleaseFullscreenDebug = addFragToBodyAndReturnNode(htmlToFrag(`<div id="pleaseFullscreenDebug"></div>`))
//setInterval(() => {
//	const deviceHeight = Math.min(window.screen.height, window.screen.width)
//	const heightTakenRatio = deviceHeight ? window.innerHeight / deviceHeight : 1 // 0..1
//	const isBigEnough = heightTakenRatio >= 0.9
//	pleaseFullscreenDebug.innerText = `
//		window.screen.height = ${window.screen.height}
//		window.screen.width = ${window.screen.width}
//		window.outerHeight = ${window.outerHeight}
//		window.outerWidth = ${window.outerWidth}
//		window.innerHeight = ${window.innerHeight}
//		window.innerWidth = ${window.innerWidth}
//		window.devicePixelRatio = ${window.devicePixelRatio}
//		window.screenTop = ${window.screenTop}
//		heightTakenRatio: ${Math.round(heightTakenRatio * 100) / 100}
//	`
//}, 100)


// common CSS

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
		color: white;
		font-size: 32px;
	}
`)


// rotation

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

const pleaseRotateDiv = addFragToBodyAndReturnNode(htmlToFrag(`
	<div id="pleaseRotate" class="landscapeFullscreenOverlay">
		<div style="text-align: center;">
			<img src="assets/pleaseRotate.png">
			<br>
			<br>
			<p>Please rotate your device</p>
		</div>
	</div>
`))


// fullscreen

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

	const pleaseFullscreen = addFragToBodyAndReturnNode(htmlToFrag(`
		<div id="pleaseFullscreen" class="landscapeFullscreenOverlay">
			<div style="text-align: center;">
				<img src="assets/pleaseFullscreen.png">
				<br>
				<br>
				<p>Please tap for fullscreen</p>
			</div>
		</div>
	`))

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

	const pleaseScrollDiv = addFragToBodyAndReturnNode(htmlToFrag(`
		<div id="pleaseScroll" class="landscapeFullscreenOverlay" style="display: flex; align-items: start;">
			<div style="text-align: center;">
				<p>Please scroll down for fullscreen, or</p>
				<br>
				<img src="assets/pleaseAddIOS.png">
			</div>
		</div>
	`))
	document.body.removeChild(pleaseScrollDiv)

	let isPleaseScrollDisplayed = false
	setInterval(() => {
		const deviceHeight = Math.min(window.screen.height, window.screen.width)
		const heightTakenRatio = deviceHeight ? window.innerHeight / deviceHeight : 1 // 0..1
		const isBigEnough = heightTakenRatio >= 0.9
		//pleaseFullscreenDebug.innerText = `
		//	heightTakenRatio = ${heightTakenRatio}
		//	isBigEnough = ${isBigEnough}
		//`
		if (!isBigEnough && !isPleaseScrollDisplayed) {
			document.body.appendChild(pleaseScrollDiv)
			window.scroll(0, 0)
			isPleaseScrollDisplayed = true
		}
		else if (isPleaseScrollDisplayed && isBigEnough) {
			document.body.removeChild(pleaseScrollDiv)
			isPleaseScrollDisplayed = false
		}
	}, 100)

	window.addEventListener('scroll', (e) => {
		if (isPleaseScrollDisplayed && window.scrollY > 0) {
			window.scroll(0, 0)
		}
	})

}


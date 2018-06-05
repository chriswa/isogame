const styleEl = document.createElement('style')
document.head.appendChild(styleEl)
const styleSheet = styleEl.sheet

export default function (str) {
	styleSheet.insertRule(str, styleSheet.cssRules.length)
}

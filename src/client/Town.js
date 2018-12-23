import TownGUI from '../gui/town/TownGUI.js'

export default new class Town {
	setActive(value) {
		TownGUI.isActive = value
	}
	setServerConnected(value) {
		TownGUI.isConnected = value
	}
	on(eventName, handler) {
		TownGUI.$on(eventName, handler)
	}
}

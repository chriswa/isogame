export default class UserAccount {
	constructor(username, data, saveFunction) {
		this.username = username
		this.data = data
		this.saveFunction = saveFunction
	}
	save() {
		this.saveFunction()
	}
}

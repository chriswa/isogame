export default function safeJsonParse(jsonString, defaultValue = undefined) {
	let retval = defaultValue
	try {
		retval = JSON.parse(jsonString)
	}
	catch (e) {
		// pass
	}
	return retval
}

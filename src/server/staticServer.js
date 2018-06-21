import fs from 'fs'
import http from 'http'
import path from 'path'
import url from 'url'

const PORT = 80

const server = http.createServer(function (req, res) {
	//console.log((new Date()) + ' Received req for ' + req.url)

	const parsedUrl = url.parse(req.url)
	let filePath = '.' + parsedUrl.pathname

	fs.exists(filePath, function (exist) {
		if (!exist) {
			res.statusCode = 404
			res.end(`File ${filePath} not found!`)
			return
		}

		if (fs.statSync(filePath).isDirectory()) {
			filePath += '/index.html'
		}

		fs.readFile(filePath, function (err, data) {
			if (err) {
				res.statusCode = 500
				res.end(`Error getting the file: ${err}.`)
				return
			}

			const ext = path.parse(filePath).ext
			// if the file is found, set Content-type and send data
			res.setHeader('Content-type', mimeType[ext] || 'text/plain')
			res.end(data)
		})
	})
});
server.listen(PORT, function () {
	console.log(`(staticServer) Listening on port ${PORT}`)
});

export default server

const mimeType = {
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.json': 'application/json',
	'.css': 'text/css',

	'.ico': 'image/x-icon',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.svg': 'image/svg+xml',

	'.wav': 'audio/wav',
	'.mp3': 'audio/mpeg',

	'.eot': 'appliaction/vnd.ms-fontobject',
	'.ttf': 'aplication/font-sfnt',
}


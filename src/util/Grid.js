export default class Grid {
	constructor(width, height, cells = []) {
		this.width = width
		this.height = height
		this.cells = cells
	}
	initCells(cellConstructorCallback) {
		this.eachCellIndex(([x, y], cellIndex) => {
			this.cells[cellIndex] = cellConstructorCallback([x, y], cellIndex, this)
		})
	}
	eachCell(callback) {
		for (let y = 0; y < this.height; y += 1) {
			for (let x = 0; x < this.width; x += 1) {
				const cellIndex = x + y * this.width
				callback(this.cells[cellIndex], [x, y], cellIndex)
			}
		}
	}
	eachCellIndex(callback) {
		for (let y = 0; y < this.height; y += 1) {
			for (let x = 0; x < this.width; x += 1) {
				const cellIndex = x + y * this.width
				callback([x, y], cellIndex)
			}
		}
	}
	getCellIndex([x, y]) {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) { return undefined }
		return x + y * this.width
	}
	getCell([x, y]) {
		const cellIndex = this.getCellIndex([x, y])
		return cellIndex === undefined ? undefined : this.cells[cellIndex]
	}
	setCell([x, y], newValue) {
		const cellIndex = this.getCellIndex([x, y])
		if (cellIndex === undefined) {
			return false
		}
		this.cells[cellIndex] = newValue
		return true
	}
}
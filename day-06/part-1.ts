export function solution(input: string): number {
	// First, parse the input into a grid
	const grid: CellType[][] = input.trim().split('\n')
		.map((line) => [...line] as CellType[])
	const width = grid[0].length
	const height = grid.length

	// Next, search for the guard
	let guard: Guard | null = null
	search: for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (grid[y][x] != CellType.Guard) continue
			grid[y][x] = CellType.Empty
			const room = new Room(grid)
			guard = new Guard(room, x, y, Direction.Up)
			break search
		}
	}
	// This should not happen, but TypeScript thinks it can
	if (!guard) throw Error(`She's gone!`)

	// Let the guard walk around until she leaves
	while (!guard.left) {
		guard.orient()
		guard.step()
	}

	// How many cells did she see?
	return guard.seenCells
}

// They're numbers so that turning becomes simpler
enum Direction {
	Up = 0,
	Right = 1,
	Down = 2,
	Left = 3,
}

enum CellType {
	Guard = '^',
	Empty = '.',
	Visited = 'X',
	Crate = '#',
	Wall = '!',
	Unknown = '?',
}

class Room {
	#map: CellType[][]

	constructor(map: CellType[][]) {
		this.#map = map
	}

	get width(): number {
		return this.#map[0].length
	}

	get height(): number {
		return this.#map.length
	}

	get visitedCells(): number {
		return this.#map.reduce((total, row) => {
			return row.filter((cell) => cell == CellType.Visited).length + total
		}, 0)
	}

	at(x: number, y: number): CellType {
		if (x < 0) return CellType.Wall
		if (y < 0) return CellType.Wall
		if (x >= this.width) return CellType.Wall
		if (y >= this.height) return CellType.Wall
		return this.#map[y][x]
	}

	visit(x: number, y: number): void {
		const current = this.at(x, y)
		if (current == CellType.Visited) return
		const occupied = current != CellType.Empty
		if (occupied) throw Error('Cannot visit occupied cell')
		this.#map[y][x] = CellType.Visited
	}
}

class Guard {
	#room: Room
	#x: number
	#y: number
	#direction: Direction
	#left = false
	#stepCount = 0

	constructor(
		room: Room,
		x: number,
		y: number,
		direction: Direction,
	) {
		this.#room = room
		this.#x = x
		this.#y = y
		this.#direction = direction
		room.visit(x, y)
	}

	get lookingAt(): CellType {
		if (this.#left) return CellType.Unknown
		const { x, y } = this.#lookingAtPosition()
		return this.#room.at(x, y)
	}

	get left(): boolean {
		return this.#left
	}

	get stepCount(): number {
		return this.#stepCount
	}

	get seenCells(): number {
		return this.#room.visitedCells
	}

	#lookingAtPosition(): { x: number; y: number } {
		const x = this.#x
		const y = this.#y
		if (this.#direction == Direction.Up) return { x, y: y - 1 }
		if (this.#direction == Direction.Right) return { x: x + 1, y }
		if (this.#direction == Direction.Down) return { x, y: y + 1 }
		if (this.#direction == Direction.Left) return { x: x - 1, y }
		throw Error(`This went in a strange direction`)
	}

	#turnRight(): void {
		let direction = this.#direction
		direction += 1
		direction %= 4
		this.#direction = direction
	}

	orient(): void {
		if (this.#left) return
		while (this.lookingAt == CellType.Crate) this.#turnRight()
	}

	step(): void {
		if (this.lookingAt == CellType.Wall) this.#left = true
		if (this.#left) return
		const { x, y } = this.#lookingAtPosition()
		this.#room.visit(x, y)
		this.#x = x
		this.#y = y
		this.#stepCount++
	}
}

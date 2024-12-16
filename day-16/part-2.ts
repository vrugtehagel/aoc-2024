export function solution(input: string): number {
	// First, we parse the maze into a grid of booleans; `true` if a cell can
	// be walked in, `false` otherwise. We also pluck out the start and end
	// positions.
	let start = { x: -1, y: -1 }
	let end = { x: -1, y: -1 }
	const maze = input.trim().split('\n').map((line, y) => {
		return [...line].map((character, x) => {
			if (character == 'S') start = { x, y }
			if (character == 'E') end = { x, y }
			if (character == '#') return false
			return true
		})
	})

	// We tell the hypothetical reindeer what the maze looks like
	HypotheticalReindeer.maze = maze

	// The starting reindeer, facing to the east. This automatically generates
	// scores for the other directions as well
	const starting = HypotheticalReindeer.at(start.x, start.y)!
	starting.couldBe(Direction.East, 0)

	// The currenly racing reindeer. There can only ever be one reindeer at a
	// specific coordinate. If a hypothetical reindeer "runs into" another one,
	// their scores get merged, where the best scores win.
	const racing = new Set<HypotheticalReindeer>()
	racing.add(starting)

	// While there are still undiscovered hypothetical reindeer, let them race
	while (racing.size > 0) {
		for (const reindeer of racing) {
			racing.delete(reindeer)
			for (const next of reindeer.moves()) racing.add(next)
		}
	}

	// Congratulations to this hypothetical reindeer, they won!
	// Now we figure out in which direction(s) it won, and tell it that
	const winner = HypotheticalReindeer.at(end.x, end.y)!
	const directions = [...winner.scores]
		.filter(([_direction, score]) => score == winner.score)
		.map(([direction]) => direction)
	for (const direction of directions) winner.winning(direction)

	// Then, we reverse the path that the hypothetical reindeer made, keeping
	// track of the "winning" reindeer (the ones currently at the ends of the
	// reversed paths) and the winners (the ones that are in such a path)
	const winners = new Set<HypotheticalReindeer>([])
	const winning = new Set<HypotheticalReindeer>([winner])
	while (winning.size > 0) {
		for (const reindeer of winning) {
			winning.delete(reindeer)
			winners.add(reindeer)
			for (const previous of reindeer.predecessors()) {
				winning.add(previous)
			}
		}
	}

	// Done! Return the number of hypothetical reindeer on winning paths,
	// because that's the same as the total occupied tiles in those paths.
	return winners.size
}

class HypotheticalReindeer {
	static #cache = new Map<string, HypotheticalReindeer>()
	static at(x: number, y: number): null | HypotheticalReindeer {
		if (!HypotheticalReindeer.maze[y][x]) return null
		const coordinates = `${x},${y}`
		const cached = this.#cache.get(coordinates)
		if (cached) return cached
		const reindeer = new HypotheticalReindeer(x, y)
		this.#cache.set(coordinates, reindeer)
		return reindeer
	}
	static maze: boolean[][]

	x: number
	y: number
	scores = new Map<Direction, number>()
	winningDirections = new Set<number>()

	get score() {
		return Math.min(...this.scores.values())
	}

	constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}

	#setScore(direction: Direction, score: number): boolean {
		const oldScore = this.scores.get(direction)
		if (oldScore != null && oldScore <= score) return false
		this.scores.set(direction, score)
		return true
	}

	couldBe(direction: Direction, score: number): boolean {
		return [
			this.#setScore(direction, score),
			this.#setScore((direction + 1) % 4, score + 1000),
			this.#setScore((direction + 3) % 4, score + 1000),
			this.#setScore((direction + 2) % 4, score + 2000),
		].includes(true)
	}

	moves(): HypotheticalReindeer[] {
		const reindeers = []
		for (const [direction, [dx, dy]] of steps.entries()) {
			const x = this.x + dx
			const y = this.y + dy
			const score = this.scores.get(direction)! + 1
			const reindeer = HypotheticalReindeer.at(x, y)
			if (!reindeer?.couldBe(direction, score)) continue
			reindeers.push(reindeer)
		}
		return reindeers
	}

	winning(direction: Direction): void {
		const score = this.scores.get(direction)!
		for (const [otherDirection, otherScore] of this.scores) {
			const rotation = [0, 1, 2, 1].at(otherDirection - direction)!
			if (otherScore != score - rotation * 1000) continue
			this.winningDirections.add(otherDirection)
		}
	}

	predecessors(): HypotheticalReindeer[] {
		const reindeers = []
		for (const direction of this.winningDirections) {
			const score = this.scores.get(direction)!
			const backwards = (direction + 2) % 4
			const [dx, dy] = steps[backwards]
			const x = this.x + dx
			const y = this.y + dy
			const reindeer = HypotheticalReindeer.at(x, y)
			if (!reindeer) continue
			if (score - 1 != reindeer.scores.get(direction)) continue
			reindeer.winning(direction)
			reindeers.push(reindeer)
		}
		return reindeers
	}
}

enum Direction {
	North = 0,
	East = 1,
	South = 2,
	West = 3,
}

const steps = [
	[0, -1],
	[1, 0],
	[0, 1],
	[-1, 0],
]

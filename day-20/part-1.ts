export function solution(input: string): number {
	// First, we parse the input into a grid of -1s and Infinity
	let start = { x: -1, y: -1 }
	let end = { x: -1, y: -1 }
	const track = input.trim().split('\n').map((line, y) => {
		return [...line].map((character, x) => {
			if (character == 'S') start = { x, y }
			if (character == 'E') end = { x, y }
			if (character == '#') return -1
			return Infinity
		})
	})
	const width = track[0].length
	const height = track.length

	// First, race the old-fashioned way and reach the end, filling each cell
	// with the amount of time it took to get there.
	let time = 0
	const current = { ...start }
	const steps = [[0, -1], [-1, 0], [1, 0], [0, 1]]
	while (!(current.x == end.x && current.y == end.y)) {
		const { x, y } = current
		track[y][x] = time
		time++
		for (const [dx, dy] of steps) {
			const cell = track[y + dy][x + dx]
			if (Number.isFinite(cell)) continue
			current.x += dx
			current.y += dy
			break
		}
	}
	track[end.y][end.x] = time

	// We want to save 100 picoseconds for the "big" race, but only 2 for the
	// example race. This is hardcoded because I don't see a nice pattern in
	// these numbers
	const savings = width < 100 ? 2 : 100

	// Now we go through the track, checking if we can cheat at each position
	// and if that cheat would give us enough of an advantage.
	let shortcuts = 0
	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			if (track[y][x] == -1) continue
			const time = track[y][x]
			for (const [dx, dy] of steps) {
				const next = track[y + 2 * dy]?.[x + 2 * dx]
				if (next == null || next == -1) continue
				if (next > time - savings - 2) continue
				shortcuts++
			}
		}
	}

	// Done!
	return shortcuts
}

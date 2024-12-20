export function solution(input: string): number {
	// Once again we parse the input into -1s and Infinity
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

	// We race the old-fashioned way
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

	// This time, we can skip up to 20 picoseconds. This builds an array of the
	// offsets that that could get us to. The tiny offsets (where x and y are
	// both between -1 and 1) are excluded because they don't let us skip to
	// another point in the track.
	const skips = []
	for (let dx = -20; dx <= 20; dx++) {
		const remaining = 20 - Math.abs(dx)
		for (let dy = -remaining; dy <= remaining; dy++) {
			const skipped = Math.abs(dx) + Math.abs(dy)
			if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) continue
			skips.push({ dx, dy, skipped })
		}
	}

	// Again we hardcode this because there's no seemingly nice pattern in the
	// test numbers versus the "real" ones.
	const savings = width < 100 ? 50 : 100

	// This is effectively the same as last time, except a tiny bit more
	// generic.
	let shortcuts = 0
	for (let x = 1; x < width - 1; x++) {
		for (let y = 1; y < height - 1; y++) {
			if (track[y][x] == -1) continue
			const time = track[y][x]
			for (const { dx, dy, skipped } of skips) {
				const next = track[y + dy]?.[x + dx]
				if (next == null || next == -1) continue
				if (next > time - savings - skipped) continue
				shortcuts++
			}
		}
	}

	// Done!
	return shortcuts
}

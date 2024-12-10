export function solution(input: string): number {
	// First, we parse the input into a grid again, the same way
	const map: number[][] = input.trim().split('\n')
		.map((line) => line.split('').map((height) => Number(height)))

	// We do essentially the same thing as before, except now we need to count
	// the duplicates. Really, this only makes it simpler; we can return the
	// rating and recursively add them up
	function findTrails(x: number, y: number): number {
		const height = map[y][x]
		if (height == 9) return 1
		let rating = 0
		for (const [dx, dy] of steps) {
			const nextHeight = map[y + dy]?.[x + dx]
			if (nextHeight != height + 1) continue
			rating += findTrails(x + dx, y + dy)
		}
		return rating
	}

	// Now we sum all the ratings
	let ratingsTotal = 0
	for (let y = 0; y < map.length; y++) {
		for (let x = 0; x < map[y].length; x++) {
			if (map[y][x] > 0) continue
			ratingsTotal += findTrails(x, y)
		}
	}

	// Done! Return the total ratings
	return ratingsTotal
}

// Possible steps we can take on the map
const steps: Array<[number, number]> = [
	[-1, 0],
	[1, 0],
	[0, -1],
	[0, 1],
] as const

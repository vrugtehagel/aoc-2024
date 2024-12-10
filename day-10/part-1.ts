export function solution(input: string): number {
	// First, we parse the input into a grid
	const map: number[][] = input.trim().split('\n')
		.map((line) => line.split('').map((height) => Number(height)))

	// Find trails recursively. Given (x, y) on the map we attempt to take a
	// step in any of the 4 directions and see if the height goes up by 1
	// We then keep track of the found trails using their "position" number
	// (i.e. their index) so that we don't need to worry about duplicates

	function findTrails(
		x: number,
		y: number,
		found: Set<number>,
	): Set<number> {
		const height = map[y][x]
		if (height == 9) return found.add(y * map[0].length + x)
		for (const [dx, dy] of steps) {
			const nextHeight = map[y + dy]?.[x + dx]
			if (nextHeight != height + 1) continue
			findTrails(x + dx, y + dy, found)
		}
		return found
	}

	// Now, walk the grid and find the starting positions (the zeroes)
	let trailCount = 0
	for (let y = 0; y < map.length; y++) {
		for (let x = 0; x < map[y].length; x++) {
			if (map[y][x] > 0) continue
			const found = new Set<number>()
			trailCount += findTrails(x, y, found).size
		}
	}

	// Done! Return the number of trails
	return trailCount
}

// Possible steps we can take on the map
const steps: Array<[number, number]> = [
	[-1, 0],
	[1, 0],
	[0, -1],
	[0, 1],
] as const

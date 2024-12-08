export function solution(input: string): number {
	// To parse the input, we create a dictionary of where all the different
	// antannas are
	const dictionary = new Map<string, Point[]>()
	const lines = input.trim().split('\n')
	const width = lines[0].length
	const height = lines.length
	lines.forEach((line, y) => {
		for (let x = 0; x < line.length; x++) {
			const node = line[x]
			if (node == '.') continue
			const antennas = dictionary.get(node) ?? []
			antennas.push({ x, y })
			dictionary.set(node, antennas)
		}
	})

	// These hold the indexes of the antinodes - not the coordinates. This
	// makes it easier to deal with antinodes that end up in the same spot.
	const antinodes = new Set<number>()

	// Scan all antinodes of a certain frequency
	function scanAntinodes([antenna, ...antennas]: Point[]): void {
		if (antennas.length == 0) return
		for (const other of antennas) {
			logAntinodeIndex(antenna, other)
			logAntinodeIndex(other, antenna)
		}
		scanAntinodes(antennas)
	}

	// Logs a single antinode into the `antinodes` set
	// It essentially starts at `base`, then walks to `target`, and then walks
	// that same amount to arrive at the antinode. If that's off the map, then
	// we ignore it, otherwise, we log the index into the `antinodes` set
	function logAntinodeIndex(base: Point, target: Point): void {
		const x = 2 * target.x - base.x
		const y = 2 * target.y - base.y
		if (x < 0 || x >= width || y < 0 || y >= height) return
		const index = x + y * width
		antinodes.add(index)
	}

	// Scan the antinodes for all the different frequencies
	for (const antennas of dictionary.values()) scanAntinodes(antennas)

	// Done!
	return antinodes.size
}

type Point = {
	x: number
	y: number
}

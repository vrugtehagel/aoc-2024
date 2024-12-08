export function solution(input: string): number {
	// Same same
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

	// Same; indexes for antinodes
	const antinodes = new Set<number>()

	// Same again; scan all antinodes of a certain frequency
	function scanAntinodes([antenna, ...antennas]: Point[]): void {
		if (antennas.length == 0) return
		for (const other of antennas) {
			logAntinodeIndexes(antenna, other)
			logAntinodeIndexes(other, antenna)
		}
		scanAntinodes(antennas)
	}

	// This one is all that changed, really. Instead of only checking the one
	// extended point starting at `base`, moving towards `target`, we just keep
	// on walking until we walk off the map. We also log `target` itself (but
	// not `base`).
	function logAntinodeIndexes(base: Point, target: Point): void {
		const dx = target.x - base.x
		const dy = target.y - base.y
		let { x, y } = target
		do {
			const index = x + y * width
			antinodes.add(index)
			x += dx
			y += dy
		} while (x >= 0 && x < width && y >= 0 && y < height)
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

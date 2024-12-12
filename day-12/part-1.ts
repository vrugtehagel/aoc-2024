export function solution(input: string): number {
	// First, parse the input into a grid
	const field = input.trim().split('\n').map((line) => [...line])

	// A cell's neighbours
	const neighbours = [[0, -1], [0, 1], [1, 0], [-1, 0]]

	// A recursive function that checks a certain location in the field, then
	// returns how big the area is of crops and how large its perimeter is.
	// It marks the "seen" crops by making them lowercase.
	function checkNeighbours(
		x: number,
		y: number,
	): { area: number; perimeter: number } {
		const crop = field[y][x]
		field[y][x] = crop.toLowerCase()
		let perimeter = 0
		let area = 1
		for (const [dx, dy] of neighbours) {
			const neighbourCrop = field[y + dy]?.[x + dx]
			if (neighbourCrop != crop) {
				if (neighbourCrop?.toUpperCase() != crop) perimeter++
				continue
			}
			const neighbour = checkNeighbours(x + dx, y + dy)
			area += neighbour.area
			perimeter += neighbour.perimeter
		}
		return { area, perimeter }
	}

	// Now we loop through the field, and if we see a crop that is uppercase,
	// we know to walk through the region (and mark all those crops lowercase).
	// We then add the price for the fencing to the total.
	let price = 0
	for (let y = 0; y < field.length; y++) {
		for (let x = 0; x < field[y].length; x++) {
			const crop = field[y][x]
			if (crop.toUpperCase() != crop) continue
			const { area, perimeter } = checkNeighbours(x, y)
			price += area * perimeter
		}
	}

	// Done!
	return price
}

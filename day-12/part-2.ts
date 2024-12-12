export function solution(input: string): number {
	// We parse the field, but this time make an extra border around the
	// resulting field
	const field = input.trim().split('\n')
		.map((line) => ['_', ...line, '_'])
	field.unshift([...field[0]].fill('_'))
	field.push([...field[0]].fill('_'))
	const width = field[0].length
	const height = field.length

	// Get an empty map - i.e. the field, but with zeroes in it
	function getEmptyMap(): BitField {
		return field.map((row) => Array(row.length).fill(0))
	}

	// Take the crops in one region from the main field onto a map
	// The map gets marked with `0b10000` where there's a crop
	// This is a recursive function
	function migrateCrops(x: number, y: number, map: BitField): number {
		const crop = field[y][x]
		map[y][x] = 0b10000
		field[y][x] = '_'
		let area = 1
		for (const [dx, dy] of offsets.values()) {
			if (field[y + dy]?.[x + dx] != crop) continue
			area += migrateCrops(x + dx, y + dy, map)
		}
		return area
	}

	// Migrate the crops of a certain region onto a map, and return both that
	// and the area of the region
	function migrateAreaMap(
		x: number,
		y: number,
	): { map: BitField; area: number } {
		const map = getEmptyMap()
		const area = migrateCrops(x, y, map)
		return { map, area }
	}

	// We essentially "stamp" the area map with an offset and mark them with
	// bits. After that we know exactly where the fences would be. The area map
	// is not altered, instead a new map is created. The positions of the crops
	// are reset back to zero, so that the perimeter map only contains the
	// fences
	function getPerimeterMap(areaMap: BitField): BitField {
		const map = getEmptyMap()
		for (const [direction, offset] of offsets) {
			const [dx, dy] = offset
			const bitmask = 0b1 << direction
			for (let y = 0; y < width; y++) {
				for (let x = 0; x < height; x++) {
					if (areaMap[y + dy]?.[x + dx]) map[y][x] |= bitmask
				}
			}
		}
		for (let y = 1; y < width - 1; y++) {
			for (let x = 1; x < height - 1; x++) {
				if (areaMap[y][x]) map[y][x] = 0
			}
		}
		return map
	}

	// Given a perimeter map, count how many fence lines there are. A fence
	// line is a row of fences in one direction (as per the instructions)
	function countFenceLines(map: BitField): number {
		let lines = 0
		for (const direction of [Direction.North, Direction.South]) {
			const bitmask = 0b1 << direction
			for (let y = 0; y < height; y++) {
				for (let x = 0; x < width; x++) {
					if (!(map[y][x] & bitmask)) continue
					lines++
					while (map[y][x] & bitmask) x++
				}
			}
		}
		for (const direction of [Direction.East, Direction.West]) {
			const bitmask = 0b1 << direction
			for (let x = 0; x < width; x++) {
				for (let y = 0; y < height; y++) {
					if (!(map[y][x] & bitmask)) continue
					lines++
					while (map[y][x] & bitmask) y++
				}
			}
		}
		return lines
	}

	// Now, we go through all the regions, migrate the crops onto a separate
	// area map, then map out the perimeter map, and lastly add the price of
	// each region to a total
	let price = 0
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (field[y][x] == '_') continue
			const { area, map: areaMap } = migrateAreaMap(x, y)
			const perimeterMap = getPerimeterMap(areaMap)
			const fenceLines = countFenceLines(perimeterMap)
			price += fenceLines * area
		}
	}

	// And that's done!
	return price
}

type Field = string[][]
type BitField = number[][]
type Offset = [number, number]

enum Direction {
	North = 0,
	East = 1,
	South = 2,
	West = 3,
}

const offsets = new Map<Direction, Offset>([
	[Direction.North, [0, -1] as const],
	[Direction.East, [1, 0] as const],
	[Direction.South, [0, 1] as const],
	[Direction.West, [-1, 0] as const],
])

export function solution(input: string): number {
	// Codes are just one per line
	const codes = input.trim().split('\n')

	// Input keypads, as grids (with a "_" for unvistable buttons)
	const numpad = [
		['7', '8', '9'],
		['4', '5', '6'],
		['1', '2', '3'],
		['_', '0', 'A'],
	]
	const arrowpad = [
		['_', '^', 'A'],
		['<', 'v', '>'],
	]

	// Get the coordinates of a certain button on a certain keypad
	function getCoordinates(button: string, keypad: string[][]): number[] {
		for (let y = 0; y < keypad.length; y++) {
			for (let x = 0; x < keypad[y].length; x++) {
				if (keypad[y][x] == button) return [x, y]
			}
		}
		throw Error('Unreachable')
	}

	// Get the "press code" for pressing a certain button after another
	function press(current: string, next: string, keypad: string[][]): string {
		const [x1, y1] = getCoordinates(current, keypad)
		const [x2, y2] = getCoordinates(next, keypad)
		const left = '<'.repeat(Math.max(0, x1 - x2))
		const right = '>'.repeat(Math.max(0, x2 - x1))
		const up = '^'.repeat(Math.max(0, y1 - y2))
		const down = 'v'.repeat(Math.max(0, y2 - y1))
		const ideal = left + down + up + right + 'A'
		const alternative = right + down + up + left + 'A'
		let [x, y] = [x1, y1]
		for (const button of ideal) {
			if (button == '^') y -= 1
			if (button == '<') x -= 1
			if (button == '>') x += 1
			if (button == 'v') y += 1
			if (keypad[y][x] == '_') return alternative
		}
		return ideal
	}

	// Enter a sequence of buttons on a keypad (starting at "A")
	function enter(sequence: string, keypad: string[][]): string {
		let current = 'A'
		let result = ''
		for (const next of sequence) {
			result += press(current, next, keypad)
			current = next
		}
		return result
	}

	// This is the major change. Instead of just generating the whole string
	// (which is probably impossible for part 2), we chop it up into parts that
	// are sandwiched between two "A" presses. This includes empty strings,
	// which emerge when two "A" presses are adjacent. We then keep track of
	// only those parts ("chunks") and loop through those for 25 iterations,
	// keeping count of how many of each chunk we have. At the end, we calculate
	// the total length of the really long string.
	let complexity = 0
	for (const code of codes) {
		let chunks = new Map()
		chunks.set(enter(code, numpad).slice(0, -1), 1)
		for (let robot = 0; robot < 25; robot++) {
			const result = new Map<string, number>()
			for (const [chunk, count] of chunks) {
				const sequence = enter(chunk + 'A', arrowpad)
				for (const newChunk of sequence.slice(0, -1).split('A')) {
					result.set(newChunk, (result.get(newChunk) ?? 0) + count)
				}
			}
			chunks = result
		}
		let length = 0
		for (const [sequence, count] of chunks) {
			length += (sequence.length + 1) * count
		}
		complexity += parseInt(code) * length
	}

	// Done!
	return complexity
}

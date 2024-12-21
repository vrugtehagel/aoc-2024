export function solution(input: string): number {
	// Codes are just one per line
	const codes = input.trim().split('\n')

	// Input keypads, as grids (with a "_" for unvisitable buttons)
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

	// Compute the complexity; first we enter the code on the numpad, then we
	// take that code and enter it on the arrowpad, and then do that again.
	let complexity = 0
	for (const code of codes) {
		const sequence = enter(enter(enter(code, numpad), arrowpad), arrowpad)
		complexity += parseInt(code) * sequence.length
	}

	// Done :D
	return complexity
}

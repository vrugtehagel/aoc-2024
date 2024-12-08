export function solution(input: string): number {
	// First, we neatly arrange input into `leftNumbers` and `rightNumbers`.
	const leftNumbers: number[] = []
	const rightNumbers: number[] = []
	const lines: string[] = input.trim().split('\n')
	for (const line of lines) {
		const [left, right] = line.split(/\s+/).map((number) => Number(number))
		leftNumbers.push(left)
		rightNumbers.push(right)
	}

	// Now that we have the lists as numbers, we can sort them.
	leftNumbers.sort((a, b) => a - b)
	rightNumbers.sort((a, b) => a - b)

	// Lastly, we compute their differences
	let distance = 0
	for (const [index, leftNumber] of leftNumbers.entries()) {
		const rightNumber = rightNumbers[index]
		distance += Math.abs(leftNumber - rightNumber)
	}

	// Done!
	return distance
}

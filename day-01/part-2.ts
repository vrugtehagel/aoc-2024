export function solution(input: string): number {
	// First, we make a list of the numbers on the left, and for the numbers on the
	// right, we compile a dictionary (map) with how often each number occurs.
	const leftNumbers: number[] = []
	const rightCounts: Map<number, number> = new Map()
	const lines: string[] = input.trim().split('\n')
	for (const line of lines) {
		const [left, right] = line.split(/\s+/).map((number) => Number(number))
		leftNumbers.push(left)
		const count = rightCounts.get(right) ?? 0
		rightCounts.set(right, count + 1)
	}

	// Next, we go through the leftNumbers and calculate the total score.
	let score = 0
	for (const number of leftNumbers) {
		const count = rightCounts.get(number)
		if (!count) continue
		score += count * number
	}

	// Done!
	return score
}

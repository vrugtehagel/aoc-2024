export function solution(input: string): number {
	// First we parse the input
	const [rawRules, rawUpdates] = input.trim().split('\n\n')
	const rules: Array<[number, number]> = rawRules.split('\n')
		.map((line) => line.split('|'))
		.map(([before, after]) => [Number(before), Number(after)])
	const updates: Array<number[]> = rawUpdates.split('\n')
		.map((line) => line.split(',').map((number) => Number(number)))
	// Now we check which of the updates are correct
	const correctUpdates = updates.filter((update) => {
		return rules.every(([before, after]) => {
			const beforeIndex = update.lastIndexOf(before)
			const afterIndex = update.indexOf(after)
			return afterIndex == -1 || beforeIndex < afterIndex
		})
	})
	// Of the correct updates, get the middle item and sum them
	return correctUpdates.map((update) => update[update.length >> 1])
		.reduce((sum, pageNumber) => sum + pageNumber)
}

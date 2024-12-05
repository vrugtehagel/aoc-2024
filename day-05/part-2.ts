export function solution(input: string): number {
	// We parse the input just the same as part 1
	const [rawRules, rawUpdates] = input.trim().split('\n\n')
	const rules: Array<[number, number]> = rawRules.split('\n')
		.map((line) => line.split('|'))
		.map(([before, after]) => [Number(before), Number(after)])
	const updates: Array<number[]> = rawUpdates.split('\n')
		.map((line) => line.split(',').map((number) => Number(number)))
	// This time we find the incorrect updates
	const incorrectUpdates = updates.filter((update) => {
		return rules.some(([before, after]) => {
			const beforeIndex = update.lastIndexOf(before)
			const afterIndex = update.indexOf(after)
			return afterIndex != -1 && afterIndex < beforeIndex
		})
	})
	// Now we'll run through the incorrect updates and correct them
	const correctedUpdates = incorrectUpdates.map((update) => {
		let rule: undefined | [number, number]
		// The strategy here is this: when we encounter a rule that is not
		// satisfied, we just move the "before" page number to right before
		// the "after" page number. Then we pray we don't get stuck in a loop.
		// This is also horribly inefficient, but here we are
		while (true) {
			let beforeIndex: number
			let afterIndex: number
			rule = rules.find(([before, after]) => {
				beforeIndex = update.lastIndexOf(before)
				afterIndex = update.indexOf(after)
				return afterIndex != -1 && afterIndex < beforeIndex
			})
			if (!rule) break
			const [before, _after] = rule
			update.splice(beforeIndex!, 1)
			update.splice(afterIndex!, 0, before)
		}
		return update
	})
	// And add up the middle page numbers
	return correctedUpdates
		.map((update) => update[update.length >> 1])
		.reduce((sum, pageNumber) => sum + pageNumber)
}

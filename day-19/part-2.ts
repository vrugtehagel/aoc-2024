export function solution(input: string): number {
	// Parsing is the same as part 1
	const [rawTowels, rawDesigns] = input.trim().split('\n\n')
	const towels = rawTowels.trim().split(/\s*,\s*/)
	const designs = rawDesigns.trim().split('\n')

	// This time, we'll be counting the number of arrangements we can choose for
	// a certain design. To speed things up, we build a cache of arrangements
	// we've already checked, mapping to the number of ways to make such a
	// design.
	const cache = new Map<string, number>()
	cache.set('', 1)

	// This is essentially the isPossible() function from part 1, but with cache
	// and it returns a number instead of a boolean.
	function countArrangements(design: string): number {
		const cached = cache.get(design)
		if (cached != null) return cached
		let amount = 0
		for (const towel of towels) {
			if (!design.startsWith(towel)) continue
			amount += countArrangements(design.slice(towel.length))
		}
		cache.set(design, amount)
		return amount
	}

	// Sum the number of ways we can make each arrangement
	let amount = 0
	for (const design of designs) {
		amount += countArrangements(design)
	}
	return amount
}

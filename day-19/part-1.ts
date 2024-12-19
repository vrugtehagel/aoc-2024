export function solution(input: string): number {
	// First, we parse into an array of towels and an array of designs
	const [rawTowels, rawDesigns] = input.trim().split('\n\n')
	const towels = rawTowels.trim().split(/\s*,\s*/)
	const designs = rawDesigns.trim().split('\n')

	// Is a design possible to build out of the available towels?
	// This is a recursive function.
	function isPossible(design: string): boolean {
		if (!design) return true
		for (const towel of towels) {
			if (!design.startsWith(towel)) continue
			if (isPossible(design.slice(towel.length))) return true
		}
		return false
	}

	// Theoretically we can already filter the designs using the `isPossible()`
	// function, but since we have a lot of towels this is really inefficient.
	// Instead, we first reduce the array of towels to a smaller one that
	// doesn't reduce our capabilities. Essentially we take out a towel, check
	// if it isPossible to make it as a design, and if so, we just leave it out.
	let towelIndex = 0
	while (towelIndex < towels.length) {
		const towel = towels[towelIndex]
		towels.splice(towelIndex, 1)
		if (isPossible(towel)) continue
		towels.splice(towelIndex, 0, towel)
		towelIndex++
	}

	// Now that we have fewer towels, this gets a bit more manageable.
	return designs.filter((design) => isPossible(design)).length
}

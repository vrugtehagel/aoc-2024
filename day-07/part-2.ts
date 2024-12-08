export function solution(input: string): number {
	// Parse the input like in part 1
	const calibrations = input.trim().split('\n').map((line) => {
		const [rawTestValue, rawTerms] = line.split(': ')
		const testValue = Number(rawTestValue)
		const terms = rawTerms.split(' ').map((rawTerm) => Number(rawTerm))
		return [testValue, terms] as [number, number[]]
	})
	// This also looks the same, but we have a different implementation for
	// `canBeMadeTrue` - a much more efficient one. The other solution can be
	// easily extended to work with an extra operator, but it is quite slow;
	// took about 2 seconds on my machine. Not too bad, but this implementation
	// ends up running in less than 10ms, so that's a bit more "acceptable".
	return calibrations
		.filter(([testValue, terms]) => canBeMadeTrue(testValue, terms))
		.reduce((sum, [testValue]) => sum + testValue, 0)
}

// We adjust this function to be backwards-recursive
// Since being divisible by a certain number or ending in one is pretty
// specific, going backwards is more efficient. For example, say we have
// `132: 5 18 1 7`. Since 132 is neither divisible by 7 nor ends in a 7, we
// know right away that the last operation must be `+`. Then we reduced the
// calibration to be `125: 5 18 1`, and we do this recursively.
function canBeMadeTrue(testValue: number, [...terms]: number[]): boolean {
	if (testValue == 0) return (terms.length == 0)
	if (terms.length == 0) return false
	const term = terms.pop()!
	if (`${testValue}`.endsWith(`${term}`)) {
		const newTestValue = Number(`${testValue}`.slice(0, -`${term}`.length))
		if (canBeMadeTrue(newTestValue, terms)) return true
	}
	if (testValue % term == 0) {
		if (canBeMadeTrue(testValue / term, terms)) return true
	}
	if (testValue < term) return false
	return canBeMadeTrue(testValue - term, terms)
}

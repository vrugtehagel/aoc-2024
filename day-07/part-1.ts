export function solution(input: string): number {
	// As always, parse the input
	const calibrations = input.trim().split('\n').map((line) => {
		const [rawTestValue, rawTerms] = line.split(': ')
		const testValue = Number(rawTestValue)
		const terms = rawTerms.split(' ').map((rawTerm) => Number(rawTerm))
		return [testValue, terms] as [number, number[]]
	})
	// Filter them based on which ones can be made true and sum the results
	return calibrations
		.filter(([testValue, terms]) => canBeMadeTrue(testValue, terms))
		.reduce((sum, [testValue]) => sum + testValue, 0)
}

// Tests one testValue and its terms, trying all different configurations until
// one works. This is a rather naive strategy that ends up being "fast enough"
function canBeMadeTrue(testValue: number, terms: number[]): boolean {
	for (const operators of getPossibleOperatorSequences(terms.length - 1)) {
		let result = terms[0]
		for (const [index, term] of terms.slice(1).entries()) {
			const operator = operators[index]
			result = operator(result, term)
		}
		if (result == testValue) return true
	}
	return false
}

type Operator = (a: number, b: number) => number
const plus = (a: number, b: number) => a + b
const times = (a: number, b: number) => a * b

// Gnererate lists of binary numbers of a certain `length`
// We cache this in the hope of being more efficient
getPossibleOperatorSequences.cache = new Map<number, Array<Operator[]>>()
getPossibleOperatorSequences.cache.set(0, [[]])
function getPossibleOperatorSequences(length: number): Array<Operator[]> {
	const cached = getPossibleOperatorSequences.cache.get(length)
	if (cached) return cached
	const sequences = getPossibleOperatorSequences(length - 1)
	const cache = [...sequences].flatMap((sequence) => {
		return [[plus, ...sequence], [times, ...sequence]]
	})
	getPossibleOperatorSequences.cache.set(length, cache)
	return cache
}

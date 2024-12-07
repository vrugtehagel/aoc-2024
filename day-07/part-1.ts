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

// We loop through binary numbers (which are really just regular numbers)
// Then we translate a "1" into a "+" and a "0" into a "*"
// So e.g. given `3267: 81 40 27` we loop through 0-4, which are in binary
// 00, 01, 10, 11, which then translates to 81 * 40 * 27, 81 * 40 + 27, and so
// on. This requires some bit shifting which usually I'm not a fan of, but this
// does make it about twice as fast compared to collecting these different
// configurations of operators in a bunch of arrays.
function canBeMadeTrue(testValue: number, terms: number[]): boolean {
	for (let binary = 2 ** (terms.length - 1); binary >= 0; binary--) {
		let result = terms[0]
		let bits = binary
		for (const term of terms.slice(1)) {
			const bit = bits & 1
			bits >>= 1
			if (bit) result += term
			else result *= term
		}
		if (result == testValue) return true
	}
	return false
}

export function solution(input: string): number {
	// First, we split on "do()", so we know at least the start of those
	// strings have mul() enabled. Then we chop off anything beyond a don't().
	const sanitized = input.split('do()')
		.flatMap((part) => part.split(`don't()`, 1))
		.join('!')
	// We join with "!" so we don't stick e.g. a "mu" and a "l(2,3)" together.
	// This actually doesn't change the result at all, but it's safer.

	// And now we do the exact same as part 1
	const matches = sanitized.matchAll(/mul\((\d{1,3}),(\d{1,3})\)/g)
	let result = 0
	for (const [_full, number, multiplier] of matches) {
		result += Number(number) * Number(multiplier)
	}
	return result
}

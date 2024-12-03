export default async function (input: string): number {
	// First, we split on "do()", so we know at least the start of those
	// strings have mul() enabled. Then we chop off anything beyond a don't().
	const parts = input.split('do()')
		.flatMap(part => part.split('don\'t()', 1))
	// And now we do the exact same as part 1, just over all the parts
	let result = 0;
	for(const part of parts){
		const matches = part.matchAll(/mul\((\d{1,3}),(\d{1,3})\)/g)
		for(const [full, number, multiplier] of matches){
			result += number * multiplier
		}
	}
	return result
}

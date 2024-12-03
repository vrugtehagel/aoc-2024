export default async function (input: string): number {
	// I feel no shame
	const matches = input.matchAll(/mul\((\d{1,3}),(\d{1,3})\)/g)
	let result = 0;
	for(const [full, number, multiplier] of matches){
		result += number * multiplier
	}
	return result
}

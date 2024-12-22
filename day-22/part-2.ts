export function solution(input: string): number {
	// Each line is a number
	const secrets = input.trim().split('\n').map((line) => Number(line))

	// The recipe to "randomize" a secret
	function randomize(secret: number): number {
		secret = ((secret << 6) ^ secret) & 0xFFFFFF
		secret = (secret >>> 5) ^ secret
		secret = ((secret << 11) ^ secret) & 0xFFFFFF
		return secret
	}

	// This time, we keep track of the last 4 differences in price, and add it
	// to a map (only if it hasn't been seen before). Using an array for the
	// last 4 items, and converting them to a string to use as map index, is
	// very slow. So, instead, we use a single integer to represent the last 4
	// differences. Specifically we use a base-32 integer where each digit
	// is a difference plus 9 (to make it >= 0). This means we can use bit
	// operations to push and shift items on and off of the last 4, and then
	// directly use the number as map index.
	const scores = new Map<number, number>()
	for (let secret of secrets) {
		let last4 = 0
		let price = secret % 10
		const seen = new Set<number>()
		for (let run = 1; run <= 2000; run++) {
			secret = randomize(secret)
			last4 = ((last4 << 5) & 0xFFFFF) + 9 + secret % 10 - price
			price = secret % 10
			if (price == 0) continue
			if (run < 4) continue
			if (seen.has(last4)) continue
			seen.add(last4)
			scores.set(last4, (scores.get(last4) ?? 0) + price)
		}
	}

	// Return the maximum number of bananas we can sell for
	return Math.max(...scores.values())
}

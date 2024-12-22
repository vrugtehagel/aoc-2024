export function solution(input: string): number {
	// Each line is a number
	const secrets = input.trim().split('\n').map((line) => Number(line))

	// The recipe to "randomize" a secret
	function randomize(secret: number): number {
		secret = ((secret << 6) ^ secret) & 0xFFFFFF
		secret = ((secret >>> 5) ^ secret) & 0xFFFFFF
		secret = ((secret << 11) ^ secret) & 0xFFFFFF
		return secret
	}

	// This time, we keep track of the last 4 differences in price, and add it
	// to a map (only if it hasn't been seen before). Then, we aggregate the
	// scores into this "scores" map. The one with the highest score wins!
	const scores = new Map<string, number>()
	for (let secret of secrets) {
		const last4 = []
		let price
		const bananas = new Map<string, number>()
		for (let run = 0; run <= 2000; run++) {
			if (price != null) last4.push(secret % 10 - price)
			price = secret % 10
			secret = randomize(secret)
			if (last4.length > 4) last4.shift()
			if (last4.length < 4) continue
			if (price == 0) continue
			const diffs = `${last4}`
			if (bananas.has(diffs)) continue
			bananas.set(diffs, price)
		}
		for (const [diffs, score] of bananas) {
			scores.set(diffs, (scores.get(diffs) ?? 0) + score)
		}
	}

	// Return the maximum number of bananas we can sell for
	return Math.max(...scores.values())
}

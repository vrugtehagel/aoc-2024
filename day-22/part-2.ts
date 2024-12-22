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

	// This time, we have to keep track of the differences from the past four
	// "random" numbers (or, well, their last digit). This ends up being quite
	// a few operations, so we allocate memory ourselves and throw basic
	// mathematical operations at it. We translate a 4-sequence of differences
	// into a base-19 number; we take the difference, add 9 (to make sure it
	// ranges 0-18) and that represents a digit. This allows us to turn those
	// 4-series in simple array indexes, which are fast to look up and write to.
	// The "scores" array keeps track of the total scores for each 4-sequence.
	// The "seen" array is reset for every monkey, and keeps track of which
	// 4-sequence we've already seen (it holds booleans).
	// We also keep track of the maximum while we're going through the monkeys,
	// so that we don't have to calculate it afterwards.
	const scores = new Uint32Array(130321)
	const seen = new Uint8Array(130321)
	let max = 0
	for (let secret of secrets) {
		let last4 = 0
		let price = secret % 10
		seen.fill(0)
		for (let run = 1; run <= 2000; run++) {
			secret = randomize(secret)
			last4 = ((last4 * 19) % 130321) + 9 + secret % 10 - price
			price = secret % 10
			if (price == 0) continue
			if (run < 4) continue
			if (seen[last4]) continue
			seen[last4] = 1
			scores[last4] += price
			if (scores[last4] > max) max = scores[last4]
		}
	}

	// Return the maximum number of bananas we can sell for
	return max
}

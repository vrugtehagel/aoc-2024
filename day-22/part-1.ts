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

	// Add up the 2000th run of each secret
	let sum = 0
	for (let secret of secrets) {
		for (let run = 0; run < 2000; run++) {
			secret = randomize(secret)
		}
		sum += secret
	}

	// And done... already?
	return sum
}

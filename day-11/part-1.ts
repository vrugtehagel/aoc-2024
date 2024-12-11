export function solution(input: string): number {
	// Parse the input into an array of numbers
	let stones: number[] = input.trim().split(' ').map((raw) => Number(raw))

	// We keep it simple. We just walk through all the steps and keep track of
	// the stones
	for (let blink = 0; blink < 25; blink++) {
		stones = stones.flatMap((stone) => {
			if (stone == 0) return [1]
			const length = Math.floor(Math.log10(stone) + 1)
			if (length % 2 == 1) return [stone * 2024]
			const half = 10 ** (length / 2)
			const firstHalf = Math.floor(stone / half)
			const lastHalf = stone % half
			return [firstHalf, lastHalf]
		})
	}

	// How many stones do we have after 25 blinks?
	return stones.length
}

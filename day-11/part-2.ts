export function solution(input: string): number {
	// Parse the input into an array of numbers
	const stones = input.trim().split(' ').map((raw) => Number(raw))

	// Clearly, we should be doing something more efficient for this one.
	// So instead of just going through all of the stones every time, we group
	// the stones that have the same number on them, because we know those are
	// going to have the same behavior. For example, if we start with 1, then
	// we get 1 -> 2024 -> 20, 24 -> 2, 0, 2, 4 and so we can group the 2's
	// to have to deal with one less stone shift.

	// Now, first of all, we must pre-fill the counts
	let counts = new Map<number, number>()
	for (const stone of stones) incrementMapEntry(counts, stone, 1)

	// This is what happens to a stone when blinking
	function stoneShift(stone: number): number[] {
		if (stone == 0) return [1]
		const length = Math.floor(Math.log10(stone) + 1)
		if (length % 2 == 1) return [stone * 2024]
		const half = 10 ** (length / 2)
		const firstHalf = Math.floor(stone / half)
		const lastHalf = stone % half
		return [firstHalf, lastHalf]
	}

	// Now, we blink  75 times
	for (let blink = 0; blink < 75; blink++) {
		const newCounts = new Map<number, number>()
		for (const [stone, count] of counts) {
			for (const shifted of stoneShift(stone)) {
				incrementMapEntry(newCounts, shifted, count)
			}
		}
		counts = newCounts
	}

	// How many stones do we have after 75 blinks?
	return [...counts.values()].reduce((total, count) => total + count, 0)
}

// Here's a handy-dandy little function that increments the count of a certain
// item. This makes it a bit easier to deal with the case where we haven't seen
// a stone just yet and so the map value is `undefined`.
function incrementMapEntry<KeyType>(
	countMap: Map<KeyType, number>,
	key: KeyType,
	amount: number,
): void {
	const count = countMap.get(key) ?? 0
	countMap.set(key, count + amount)
}

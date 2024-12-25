export function solution(input: string): number {
	// First, we parse the schematics - but not too far. Each schematic will
	// remain as a string for now. We also retrieve the width and height for
	// the schematics.
	const schematics = input.split('\n\n')
	const example = schematics[0]
	const width = BigInt(example.split('\n')[0].length)
	const height = BigInt(example.split('\n').length)

	// Now, we convert each schematic into a number (note; not an array of
	// numbers). The number is a base (height - 1) representation of the columns
	// but with zeroes interlaced. For example, for a schematic where each
	// column can have a maximum height of 5, such as [4,0,2,1,5], we would
	// write 4020105 (that's base 6).
	const base = height - 1n
	const locks: bigint[] = []
	const keys: bigint[] = []
	for (const schematic of schematics) {
		let id = 0n
		for (let y = 1n; y < height - 1n; y++) {
			for (let x = 0n; x < width; x++) {
				if (schematic[Number(x + y * (width + 1n))] == '.') continue
				id += base ** (2n * x)
			}
		}
		if (schematic[0] == '.') keys.push(id)
		else locks.push(id)
	}

	// It has then become relatively simple to check if a lock fits a key; all
	// we need to do is add the lock and key and see if any of the interlaced
	// zeroes have become a 1.
	function fits(key: bigint, lock: bigint): boolean {
		let fit = lock + key
		while (fit > 0n) {
			fit /= base
			if (fit % base > 0n) return false
			fit /= base
		}
		return true
	}

	// Let's get counting!
	let matches = 0
	for (const lock of locks) {
		for (const key of keys) {
			if (fits(key, lock)) matches++
		}
	}
	return matches
}

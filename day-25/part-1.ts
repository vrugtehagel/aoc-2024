export function solution(input: string): number {
	const schematics = input.split('\n\n')
	const example = schematics[0]
	const width = BigInt(example.split('\n')[0].length)
	const height = BigInt(example.split('\n').length)
	const base = height - 1n

	const locks: number[] = []
	const keys: number[] = []
	for (const schematic of schematics) {
		let id = 0n
		for (let y = 1n; y < height - 1n; y++) {
			for (let x = 0n; x < width; x++) {
				if (schematic[x + y * (width + 1n)] == '.') continue
				id += base ** (2n * x)
			}
		}
		if (schematic[0] == '.') keys.push(id)
		else locks.push(id)
	}

	function fits(key: bigint, lock: bigint): boolean {
		let fit = lock + key
		while (fit > 0n) {
			fit /= base
			if (fit % base > 0n) return false
			fit /= base
		}
		return true
	}

	let matches = 0
	for (const lock of locks) {
		for (const key of keys) {
			if (fits(key, lock)) matches++
		}
	}

	return matches
}

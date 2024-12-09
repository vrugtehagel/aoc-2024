export function solution(input: string): number {
	// We first parse the input. We do this by keeping track of two things,
	// separately; first, the "free disk space", i.e. the gaps in between the
	// files. Next, the files (with their IDs, address, and size).
	const freeDiskSpace = new Map<number, number[]>()
	const files: Array<{ address: number; size: number; id: number }> = []

	let address = 0
	;[...input].forEach((digit: string, index: number) => {
		const size = Number(digit)
		const isFile = index % 2 == 0
		if (isFile) {
			const id = index >> 1
			const file = { address, size, id }
			files.push(file)
		} else if (size > 0) {
			const gaps = freeDiskSpace.get(size) ?? []
			gaps.push(address)
			freeDiskSpace.set(size, gaps)
		}
		address += size
	})

	// Now we loop through the files backwards. The files are not ordered by
	// address (or, well, they are at first, but we don't try to keep it that
	// way).
	for (let index = files.length - 1; index >= 0; index--) {
		const file = files[index]
		// First we find the left-most address that fits the current file
		let newAddress: number | null = null
		let gapSize: number | null = null
		for (let { size } = file; size < 10; size++) {
			const address = freeDiskSpace.get(size)?.[0]
			if (address == null) continue
			if (newAddress != null && newAddress < address) continue
			newAddress = address
			gapSize = size
		}
		// If it doesn't fit anywhere before its current address, leave it
		if (newAddress == null || gapSize == null) continue
		if (newAddress > file.address) continue
		// We're going to use this gap, so remove it
		freeDiskSpace.get(gapSize!)!.shift()
		const newGapSize = gapSize - file.size
		// Adjust the file's address
		file.address = newAddress
		// Placing a file in a gap creates a new, smaller gap. If that gap
		// is size 0, then it is not really a gap so we don't need to do
		// anything. Otherwise, we must re-register the gap
		if (newGapSize == 0) continue
		const newGapAddress = newAddress + file.size
		const gaps = freeDiskSpace.get(newGapSize) ?? []
		const gapIndex = gaps.findIndex((address) => address > newGapAddress)
		gaps.splice(gapIndex == -1 ? 0 : gapIndex, 0, newGapAddress)
		freeDiskSpace.set(newGapSize, gaps)
	}

	// We don't have to lay out the disk, we can just loop through the files
	// now because we know exactly how much they contribute to the checksum.
	let checksum = 0
	for (const file of files) {
		for (let offset = 0; offset < file.size; offset++) {
			checksum += (file.address + offset) * file.id
		}
	}
	return checksum
}

export function solution(input: string): string {
	// Just like part 1, we parse our input into a mapping of each computer to
	// the set of every other computer it is connected to. This time, we include
	// a computer within the connected computers it maps to.
	const computers = new Map<string, Set<string>>()
	const rawLinks = input.trim().split('\n')
	for (const rawLink of rawLinks) {
		const [from, to] = rawLink.split('-')
		computers.get(from)?.add(to) ?? computers.set(from, new Set([to]))
		computers.get(to)?.add(from) ?? computers.set(to, new Set([from]))
		computers.get(from)!.add(from)
		computers.get(to)!.add(to)
	}

	// Checks if a set of computers are all individually connected to each other
	function isNetwork(group: Set<string>): boolean {
		for (const computer of group) {
			const connected = computers.get(computer)!
			if (!group.isSubsetOf(connected)) return false
		}
		return true
	}

	// Try to find a network of a certain size within a group of computers. This
	// function is recursive; it tries all possible subsets of group that have
	// the specified size. Once it finds a network, it stops looking and returns
	// it. If there are none, it returns null.
	function findNetworkWithin(
		group: Set<string>,
		size: number,
	): null | Set<string> {
		if (group.size == size) return isNetwork(group) ? group : null
		for (const computer of group) {
			const smaller = new Set(group)
			smaller.delete(computer)
			const found = findNetworkWithin(smaller, size)
			if (found) return found
		}
		return null
	}

	// Finds a network of a certain size within the input data.
	function findNetwork(size: number): null | Set<string> {
		for (const connected of computers.values()) {
			const network = findNetworkWithin(connected, size)
			if (network) return network
		}
		return null
	}

	// We try to find a connected network, starting from the largest possible
	// size. Then, if a network of a certain size doesn't exist, we start over
	// but look for a size that is 1 smaller than before.
	let size = Math.max(...[...computers.values()].map(({ size }) => size))
	while (size > 0) {
		const network = findNetwork(size)
		if (network) return [...network].sort().join(',')
		size--
	}

	// This can't happen because we know already there are networks of size 2
	return ''
}

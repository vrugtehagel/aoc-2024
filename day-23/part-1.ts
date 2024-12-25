export function solution(input: string): number {
	// First, we parse our input into a map that maps a computer to all the
	// other computers it is connected to. A computer is represented as the
	// given two-character string in the input.
	const computers = new Map<string, Set<string>>()
	const rawLinks = input.trim().split('\n')
	for (const rawLink of rawLinks) {
		const [from, to] = rawLink.split('-')
		computers.get(from)?.add(to) ?? computers.set(from, new Set([to]))
		computers.get(to)?.add(from) ?? computers.set(to, new Set([from]))
	}

	// Now we create a set of all the networks that include a t-computer. We add
	// each three interconnected computer triple to this "networks" set, as a
	// sorted set of dash-concatenated computer IDs (e.g. 'co-ka-te'). This also
	// helps avoid duplicates.
	const networks = new Set<string>()
	for (const [computer1, connections] of computers) {
		for (const computer2 of connections) {
			const overlap = computers.get(computer2)!.intersection(connections)
			for (const computer3 of overlap) {
				const computers = [computer1, computer2, computer3]
				if (!computers.some((computer) => computer[0] == 't')) continue
				const network = computers.sort().join('-')
				networks.add(network)
			}
		}
	}

	// And done! Return the number of networks.
	return networks.size
}

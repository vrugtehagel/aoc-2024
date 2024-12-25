export function solution(input: string): number {
	// A wire will be represented as a function that recursively retrieves its
	// value through its parents.
	const wires: Record<string, () => number> = {}

	// Operations, so we can look them up easily later
	const operations = {
		OR: (a: number, b: number) => a | b,
		XOR: (a: number, b: number) => a ^ b,
		AND: (a: number, b: number) => a & b,
	}

	// So, first, we must define the wires that have a value already
	const [rawInputs, rawGates] = input.trim().split('\n\n')
	for (const rawInput of rawInputs.split('\n')) {
		const [name, rawValue] = rawInput.split(': ')
		const value = Number(rawValue)
		wires[name] = () => value
	}

	// Now we process the connected gates; we cache the value, to speed things
	// up.
	for (const rawGate of rawGates.split('\n')) {
		const [wire1, operation, wire2, _, out] = rawGate.split(' ')
		let value
		const gate = operations[operation as keyof typeof operations]
		wires[out] = () => value ??= gate(wires[wire1](), wires[wire2]())
	}

	// Now that we have all our wires set up, we retrieve the ones that start
	// with a "z", sort them alphabetically, and get their outputs
	const bits = Object.keys(wires)
		.filter((name) => name.startsWith('z'))
		.sort()
		.map((name) => wires[name]())

	// Just stick the bits together last-to-first, and parse the binary number
	return parseInt(bits.reverse().join(''), 2)
}

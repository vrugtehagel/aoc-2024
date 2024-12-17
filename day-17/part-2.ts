export function solution(input: string): bigint {
	const [_full, rawInstructions] = input.match(/Program: (.*)/)!
	const instructions = rawInstructions.trim().split(',')
		.map((number) => BigInt(number))

	const names = ['adv', 'bxl', 'bst', 'jnz', 'bxc', 'out', 'bdv', 'cdv']
	const comboInstructions = ['adv', 'bst', 'out', 'dbv', 'cdv']

	// We will assume the program only contains one "jnz" instruction, and
	// that it occurs at the end of the program followed by the literal "0"
	// We will also assume that there is only one "adv" instruction, and that
	// it is followed by a "3".
	// Additionally, we assume there is only one "out" instruction.
	const expectOne = (
		instruction: string,
		expect: { literal?: bigint; index?: number } = {},
	): void => {
		const opcodes = instructions.filter((_, index) => index % 2 == 0)
		const opcode = BigInt(names.indexOf(instruction))
		if (opcode < 0) throw Error('Unsupported')
		const index = opcodes.indexOf(opcode) * 2
		if (index < 0) throw Error('Unsupported')
		const lastIndex = opcodes.lastIndexOf(opcode) * 2
		if (index != lastIndex) throw Error('Unsupported')
		if ((expect.index ?? index) != index) throw Error('Unsupported')
		const literal = instructions[index + 1]
		if ((expect.literal ?? literal) != literal) throw Error('Unsupported')
	}
	expectOne('jnz', { index: instructions.length - 2, literal: 0n })
	expectOne('adv', { literal: 3n })
	expectOne('out')

	// We will also assume that the initial value for the B and C registers do
	// not matter; that is, either they are unusused or overwritten by
	// something depending on the A register.
	const run = (a: bigint) => {
		const registers = [0n, 1n, 2n, 3n, a, 0n, 0n]
		let cursor = 0
		const out: bigint[] = []
		while (cursor < instructions.length) {
			const name = names[Number(instructions[cursor])]
			const isCombo = comboInstructions.includes(name)
			const literal = instructions[cursor + 1]
			const value = isCombo ? registers[Number(literal)] : literal
			if (name == 'out') out.push(value % 8n)
			if (name == 'adv') registers[4] >>= value
			if (name == 'bxl') registers[5] ^= value
			if (name == 'bst') registers[5] = value % 8n
			if (name == 'bxc') registers[5] ^= registers[6]
			if (name == 'bdv') registers[5] = registers[4] >> value
			if (name == 'cdv') registers[6] = registers[4] >> value
			if (name == 'jnz' && registers[4] != 0n) cursor = Number(value)
			else cursor += 2
		}
		return out
	}

	// Now, we can work backwards through the program. We first start by trying
	// every 3-bit value for a, and seeing which of them results in the
	// last-output number (i.e. the last instruction). This could be more than
	// one match (or none), so we must seek starting from the smallest match.
	function findSmallestMatch(a: bigint, index: number): bigint {
		if (index < 0) return a
		const expected = instructions[index]
		for (let bits = 0n; bits < 8n; bits++) {
			const guess = (a << 3n) + bits
			const out = run(guess)
			if (out[0] != expected) continue
			const matched = findSmallestMatch(guess, index - 1)
			if (matched) return matched
		}
		return 0n
	}

	// And then, after all our assumptions, we find our answer
	return findSmallestMatch(0n, instructions.length - 1)
}

export function solution(input: string): string {
	// Parse the input - we convert the numbers to bigints
	const regex = /^.*?A: (\d+).*B: (\d+).*C: (\d+).*Program: (.*)$/s
	const [_full, rawA, rawB, rawC, rawInstructions] = input.match(regex)!
	const a = BigInt(rawA)
	const b = BigInt(rawB)
	const c = BigInt(rawC)
	const instructions = rawInstructions.trim().split(',')
		.map((raw) => BigInt(raw))

	// We could use the opcodes instead, but I like the "readability" of the
	// command names
	const names = ['adv', 'bxl', 'bst', 'jnz', 'bxc', 'out', 'bdv', 'cdv']
	const comboInstructions = ['adv', 'bst', 'out', 'dbv', 'cdv']

	// We define registers with index 0-3 so that we can retrieve the value for
	// combo instructions using registers[combo], since that then results in
	// 0-3 respectively for 0-3.
	const registers = [0n, 1n, 2n, 3n, a, b, c]
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
	return out.join(',')
}

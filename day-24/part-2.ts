export function solution(input: string): string {
	// This is the structure of the computer. Data flows down and to the right.
	// It extends all the way to the end. The gates/wires are not actually
	// labeled as in this illustration (although x, y and z are).
	//
	// x00  y00  x01  y01  x02  y02  x03  y03
	//  | \/ |    | \/ |    | \/ |    | \/ |
	//  | /\ |    | /\ |    | /\ |    | /\ |
	// [^]  [&]  [^]  [&]  [^]  [&]  [^]  [&]
	// z00  b00  a01  b01  a02  b02  a03  b03
	//       | \  | \  |    | \  |    | \  |     …
	//       |  \ | |  |    | |  |    | |  |
	//       \   [&]--[|]--[&]--[|]--[&]--[|]-
	//        \  c01| d01  c02| d02  c03| d03
	//         \    |    \    |    \    |    \
	//          \   /     \   /     \   /
	//           [^]       [^]       [^]
	//           z01       z02       z03
	//
	// We will rely on this structure heavily to figure out which wires need to
	// be swapped. To do this, we try to order the gates and wires into
	// "digits", where we consider xNN and yNN and all the gates below them (if
	// arranged as above) as one "digit".

	const [_rawInputs, rawGates] = input.trim().split('\n\n')
	const gates = new Set<Gate>()
	for (const rawGate of rawGates.split('\n')) {
		const [in1, operation, in2, _, out] = rawGate.split(' ')
		gates.add({ in: [in1, in2], operation, out })
	}

	// We build a set of gates that form xNN, yNN and everything "below" them
	// (including zNN). This should be a set of 5 gates (except for the 0th
	// digit).
	function getDigit(gates: Set<Gate>, index: number): Set<Gate> {
		const suffix = index.toString().padStart(2, '0')
		const xNN = 'x' + suffix
		const zNN = 'z' + suffix
		const found = new Set<Gate>()
		for (const gate of gates) {
			if (gate.in.includes(xNN)) found.add(gate)
			if (gate.out == zNN) found.add(gate)
		}
		if (index == 0) return found
		while (found.size < 5) {
			for (const { out } of [...found]) {
				for (const gate of gates) {
					if (gate.in.includes(out)) found.add(gate)
				}
			}
		}
		return found
	}

	// Validate a digit. Returns the two wires that need to be swapped, if any.
	// We actually already know where the gates need to be, either by how many
	// connections they are, or what gate they are using. So after we determine
	// their positions all we need to do is check the output wires.
	function validate(digit: Set<Gate>): string[] {
		const ids = new Set<string>()
		const suffix = [...digit]
			.find((gate) => /^[xy]/.test(gate.in[0]))!.in[0].slice(1)
		if (suffix == '00') return []
		const xNN = 'x' + suffix
		const zNN = 'z' + suffix
		for (const gate of digit) {
			ids.add(gate.in[0])
			ids.add(gate.in[1])
			ids.add(gate.out)
		}
		const a = [...digit].find((gate) => {
			return gate.operation == 'XOR' && gate.in.includes(xNN)
		})!
		const b = [...digit].find((gate) => {
			return gate.operation == 'AND' && gate.in.includes(xNN)
		})!
		const c = [...digit].find((gate) => {
			return gate.operation == 'AND' && gate != b
		})!
		const d = [...digit].find((gate) => {
			return gate.operation == 'OR'
		})!
		const z = [...digit].find((gate) => {
			return gate.operation == 'XOR' && gate != a
		})!
		const aOut = c.in.find((id) => ids.has(id))!
		if (aOut != a.out) return [a.out, aOut]
		const bOut = d.in.find((id) => id != c.out)!
		if (bOut != b.out) return [b.out, bOut]
		const cOut = d.in.find((id) => id != b.out)!
		if (cOut != c.out) return [c.out, cOut]
		if (zNN != z.out) return [z.out, zNN]
		return []
	}

	// With those functions defined, we can build the digits...
	const remaining = new Set<Gate>(gates)
	const digits = []
	while (remaining.size > 0) {
		const index = digits.length
		const digit = getDigit(remaining, index)
		digits.push(digit)
		for (const gate of digit) remaining.delete(gate)
	}

	// ...and find the invalid gates.
	const swapped = []
	for (const digit of digits) swapped.push(...validate(digit))

	// And that's done!
	return swapped.sort().join(',')
}

type Gate = {
	in: string[]
	operation: string
	out: string
}

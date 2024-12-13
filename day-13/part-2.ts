export function solution(input: string): bigint {
	// Again we parse, and we add the 10,000,000,000,000 here
	const machines = input.trim().split('\n\n').map((rawMachine) => {
		return Object.fromEntries(
			rawMachine.split('\n').map((line) => {
				const [_full, rawType, rawX, rawY] = line
					.match(/([AB]|Prize):.*X[+=](\d+), Y[+=](\d+)/)!
				const type = rawType.toLowerCase()
				const x = BigInt(rawX) +
					(type == 'prize' ? 10000000000000n : 0n)
				const y = BigInt(rawY) +
					(type == 'prize' ? 10000000000000n : 0n)
				return [type, { x, y }]
			}),
		)
	})

	// Pretty much the same algorithm, but adjusted to use bigints instead
	function euclidsAlgorithm(a: bigint, b: bigint): [bigint, bigint] {
		const divisor = a / b // Bigints already round it
		const remainder = a - divisor * b
		if (remainder == 0n) return [1n, 1n - divisor]
		const [n, m] = euclidsAlgorithm(b, remainder)
		return [m, n - m * divisor]
	}

	// Iterating has now become extremely inefficient, so we'll instead just
	// solve the equations. We know all solutions for both the x side and the
	// y side, so we can express them and solve the linear system in two
	// unknowns.
	function findSolution(
		a: { x: bigint; y: bigint },
		b: { x: bigint; y: bigint },
		prize: { x: bigint; y: bigint },
	): [bigint, bigint] {
		let [nx, mx] = euclidsAlgorithm(a.x, b.x)
		const gcdx = a.x * nx + b.x * mx
		if (prize.x % gcdx != 0n) return [0n, 0n]
		nx *= prize.x / gcdx
		mx *= prize.x / gcdx
		const dnx = b.x / gcdx
		const dmx = -a.x / gcdx
		let [ny, my] = euclidsAlgorithm(a.y, b.y)
		const gcdy = a.y * ny + b.y * my
		if (prize.y % gcdy != 0n) return [0n, 0n]
		ny *= prize.y / gcdy
		my *= prize.y / gcdy
		const dny = b.y / gcdy
		const dmy = -a.y / gcdy
		// Solutions are of the form
		//   nx + kx * dnx = ny + ky * dny (the two expressions for A presses)
		//   mx + kx * dmx = my + ky * dmy (the two expressions for B presses)
		// for some kx, ky
		// So, we solve this equation for kx, ky and then we're done
		const numerator = nx * dmx - mx * dnx - ny * dmx + my * dnx
		const denominator = dny * dmx - dnx * dmy
		if (numerator % denominator != 0n) return [0n, 0n]
		const ky = numerator / denominator
		return [ny + ky * dny, my + ky * dmy]
	}

	// Now we loop through all the machines. We generate the Bezout solutions
	// For only the x-direction, and check in the y direction if it happens to
	// end up the way we need it to. Note that this loops starting with the
	// lower possible `aPresses` (so that the number of tokens needed is the
	// minimum)
	let tokens = 0n
	for (const machine of machines) {
		const { a, b, prize } = machine
		const [aPresses, bPresses] = findSolution(a, b, prize)
		tokens += 3n * aPresses + 1n * bPresses
	}

	// Done!
	return tokens
}

export function solution(input: string): number {
	// First we parse; this is a tiny bit more complex than usual
	const machines = input.trim().split('\n\n').map((rawMachine) => {
		return Object.fromEntries(
			rawMachine.split('\n').map((line) => {
				const [_full, rawType, rawX, rawY] = line
					.match(/([AB]|Prize):.*X[+=](\d+), Y[+=](\d+)/)!
				const type = rawType.toLowerCase()
				const x = Number(rawX)
				const y = Number(rawY)
				return [type, { x, y }]
			}),
		)
	})

	// Okay, this is fun! We get to do math! The claw machines are essentially
	// Bezout's identity but with two-dimensional vectors. So all we need to do
	// is solve a.x * N + b.x * M = prize.x and the same for y. These types of
	// equations are not particularly hard to solve in general, so let's just
	// do that. To solve them, we do Euclid's algorithm.
	// The return value is the amount of `a` and `b` needed, respectively, and
	// then multiplying them by `a` and `b` and adding them results in the GCD.
	function euclidsAlgorithm(a: number, b: number): [number, number] {
		const divisor = Math.floor(a / b)
		const remainder = a - divisor * b
		if (remainder == 0) return [1, 1 - divisor]
		const [n, m] = euclidsAlgorithm(b, remainder)
		return [m, n - m * divisor]
	}

	// Now, we can find just one solution to ax + by = d, but we need all
	// positive solutions
	function* iterateBezoutSolutions(
		a: number,
		b: number,
		target: number,
	): Generator<[number, number]> {
		let [n, m] = euclidsAlgorithm(a, b)
		const gcd = a * n + b * m
		if (target % gcd != 0) return
		const dn = b / gcd
		const dm = -a / gcd
		if (n > 0) {
			m -= dm * (Math.floor(n / dn) + 1)
			n -= dn * (Math.floor(n / dn) + 1)
		}
		n *= target / gcd
		m *= target / gcd
		do {
			if (n > 0 && m > 0) yield [n, m]
			n += dn
			m += dm
		} while (m > 0)
	}

	// Now we loop through all the machines. We generate the Bezout solutions
	// For only the x-direction, and check in the y direction if it happens to
	// end up the way we need it to. Note that this loops starting with the
	// lower possible `aPresses` (so that the number of tokens needed is the
	// minimum)
	let tokens = 0
	for (const machine of machines) {
		const { a, b, prize } = machine
		const generator = iterateBezoutSolutions(a.x, b.x, prize.x)
		for (const [aPresses, bPresses] of generator) {
			if (a.y * aPresses + b.y * bPresses != prize.y) continue
			tokens += 3 * aPresses + 1 * bPresses
			break
		}
	}

	return tokens
}

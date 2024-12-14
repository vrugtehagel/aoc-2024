export function solution(input: string): number {
	// Parse the input into readable objects
	const robots = input.trim().split('\n').map((line) => {
		const match = line.match(/^p=(-?\d+),(-?\d+)\s+v=(-?\d+),(-?\d+)$/)!
		const [_, px, py, vx, vy] = match
		const position = { x: Number(px), y: Number(py) }
		const velocity = { x: Number(vx), y: Number(vy) }
		return { position, velocity }
	})

	// Technically the width and height are given, but to make it work for both
	// the example and the main challenge, we read the maximum starting x and y
	// coordinates from the input. This is not guaranteed to work, but it does
	const width = Math.max(...robots.map((robot) => robot.position.x)) + 1
	const height = Math.max(...robots.map((robot) => robot.position.y)) + 1
	const seconds = 100
	// To help determine the quadrants
	const halfway = { x: (width - 1) / 2, y: (height - 1) / 2 }

	// Essentially just the `%` operator, but always returns positive numbers
	function mod(number: number, modulus: number): number {
		const result = number % modulus
		if (result >= 0) return result
		return result + modulus
	}

	// Now figure out where each robot ends up
	const quadrants = [[0, 0], [0, 0]]
	for (const robot of robots) {
		const { position, velocity } = robot
		const x = mod(position.x + velocity.x * seconds, width)
		if (x == halfway.x) continue
		const xQuadrant = x < halfway.x ? 0 : 1
		const y = mod(position.y + velocity.y * seconds, height)
		if (y == halfway.y) continue
		const yQuadrant = y < halfway.y ? 0 : 1
		quadrants[xQuadrant][yQuadrant]++
	}

	// Return the "safety factor"
	const [[q1, q2], [q3, q4]] = quadrants
	return q1 * q2 * q3 * q4
}

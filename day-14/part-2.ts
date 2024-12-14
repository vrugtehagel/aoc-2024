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
	const size = { x: width, y: height }

	// Essentially just the `%` operator, but always returns positive numbers
	function mod(number: number, modulus: number): number {
		const result = number % modulus
		if (result >= 0) return result
		return result + modulus
	}

	// This tries to find a point in time where the robots "bunch up". We look
	// in only the row or column direction, and calculate the variance of the
	// robots. For example, we count the amount of robots in each column. This
	// repeats every `width` seconds (so we don't need to check beyond that)
	// and if the robots are bunched up then the variance will spike. So we
	// return the amount of `seconds` after which the variance is highest.
	function getDirectionalBunchUp(dir: 'x' | 'y'): number {
		let maxVariance = -1
		let time = -1
		const squareOfMean = (robots.length / size[dir]) ** 2
		for (let seconds = 0; seconds < size[dir]; seconds++) {
			const counts: number[] = Array.from({ length: size[dir] }, () => 0)
			for (const robot of robots) {
				const { position, velocity } = robot
				const endPosition = position[dir] + velocity[dir] * seconds
				const index = mod(endPosition, size[dir])
				counts[index]++
			}
			const sumOfSquares = counts
				.reduce((sum, count) => sum + count ** 2, 0)
			const meanOfSquares = sumOfSquares / counts.length
			const variance = meanOfSquares - squareOfMean
			if (variance <= maxVariance) continue
			maxVariance = variance
			time = seconds
		}
		return time
	}

	// When do they bunch up in the x and y direction?
	const bunchup = {
		x: getDirectionalBunchUp('x'),
		y: getDirectionalBunchUp('y'),
	}

	// Now we know when the robots bunch up in each direction, we just have
	// to find when they intersect. The x-direction has period `size.x` and the
	// y direction has period `size.y`.
	for (let seconds = bunchup.x; seconds < width * height; seconds += width) {
		if ((seconds - bunchup.y) % height != 0) continue
		return seconds
	}

	// We didn't find the Christmas tree :(
	// This can only happen if the bunchups in each direction never overlaps
	return -1
}

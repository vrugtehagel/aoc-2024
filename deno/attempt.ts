import { getExpectedOutput, runSolution } from './runner.ts'

const day = Number(Deno.args[0])
if (!day) throw Error('Invalid day')

const runs = []
for (const part of [1, 2]) {
	for (const example of [true, false]) {
		const rawExpected = await getExpectedOutput(day, part, example)
		const output = await runSolution(day, part, example)
		if (output === null) continue
		const convertToNumber = rawExpected?.includes(`${Number(rawExpected)}`)
		const expected = convertToNumber ? Number(rawExpected) : rawExpected
		const test = `Part ${part}` + (example ? ' (example)' : '')
		let status
		if (rawExpected == null) status = '-'
		else if (expected == output) status = 'ok'
		else status = 'fail'
		runs.push({ test, output, expected, status })
	}
}

console.table(runs)

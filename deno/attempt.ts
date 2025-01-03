import { getExpectedOutput, runSolution } from './runner.ts'

const day = Number(Deno.args[0])
const onlyExample = Deno.args[1] == '--example'
if (!day) throw Error('Invalid day')

const runs = []
const runExamples = onlyExample ? [true] : [true, false]
for (const part of [1, 2]) {
	for (const example of runExamples) {
		const rawExpected = await getExpectedOutput(day, part, example)
		if (example && rawExpected === null) continue
		const output = await runSolution(day, part, example)
		if (output === null) continue
		const expected = rawExpected?.includes(`${Number(rawExpected)}`)
			? Number(rawExpected)
			: rawExpected?.trim()
		const test = `Part ${part}` + (example ? ' (example)' : '')
		let status
		if (rawExpected == null) status = '-'
		else if (expected == output) status = 'ok'
		else status = 'fail'
		runs.push({ test, output, expected, status })
	}
}

console.table(runs)

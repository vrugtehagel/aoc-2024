import { getExpectedOutput, runSolution } from './runner.ts'

const now = new Date()
const maxDay = now.getFullYear() == 2024 ? now.getDate() : 31
for (let day = 1; day <= maxDay; day++) {
	for (const part of [1, 2]) {
		const expected = await getExpectedOutput(day, part)
		const name = `Day ${day}, part ${part}`
		const ignore = !expected
		const fn = async () => {
			const result = await runSolution(day, part, false, true)
			const perfect = result == expected
			const probablyFine = `${result}`.trim() == expected?.trim()
			const ok = perfect || probablyFine
			if (!ok) throw Error(`Day ${day} failed!`)
		}
		Deno.test({ name, ignore, fn })
	}
}

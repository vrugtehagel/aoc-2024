import { getExpectedOutput, runSolution } from './runner.ts'

const now = new Date()
const maxDay = now.getFullYear() == 2024 ? Math.min(now.getDate(), 25) : 25
for (let day = 1; day <= maxDay; day++) {
	const parts = day < 25 ? [1, 2] : [1]
	for (const part of parts) {
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

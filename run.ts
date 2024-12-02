const day: number = Number(Deno.args[0])
const part: number = Number(Deno.args[1])
const dayExists = day > 0 && day <= 31
if (!dayExists) {
	throw Error(`You must specify a day.`)
}
const directory = `./day-${day.toString().padStart(2, '0')}`

async function readFile(path: string): Promise<string | null> {
	const url = new URL(`${directory}/${path}`, import.meta.url)
	return await Deno.readTextFile(url).catch(() => null)
}

async function runPart(number: number): Promise<void> {
	const mod = await import(`${directory}/part-${number}.ts`)
	const solution = mod.default
	const exampleInput = await readFile('example/input.txt')
	const exampleOutput = await readFile(`example/output-${number}.txt`)
	console.log(`%cPart ${number}:`, 'color: gray')
	if (exampleInput == null || exampleOutput == null) {
		console.log('%c? %cExample not found', 'color: gray')
	} else if (solution(exampleInput) != exampleOutput) {
		console.log('%c✘ %cExample failed!', 'color: red', 'color: initial')
		return
	} else {
		console.log('%c✓ %cExample ok', 'color: green', 'color: initial')
	}
	const input = await readFile('input.txt')
	console.log('%c? Solution:', 'color: gray', solution(input ?? ''))
}

if (part) await runPart(part)
else {
	await runPart(1)
	await runPart(2)
}

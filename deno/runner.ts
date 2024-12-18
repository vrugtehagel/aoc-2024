import { getInputFile, getOutputFile, getSolutionFile } from './files.ts'

export async function runSolution(
	day: number,
	part: number,
	example: boolean = false,
	skipCompilation: boolean = false,
): Promise<string | number | null> {
	const solutionFile = await getSolutionFile(day, part)
	if (!solutionFile) return null
	const run = solutionFile.endsWith('.wat') ? runWATSolution : runJSSolution
	const result = await run(solutionFile, day, part, example, skipCompilation)
	if (result == null) return null
	if (typeof result == 'object') return `${result}`
	return result
}

export async function getExpectedOutput(
	day: number,
	part: number,
	example: boolean = false,
): Promise<string | null> {
	return await getProvided('output', day, part, example)
}

async function getProvided(
	provided: 'input' | 'output',
	day: number,
	part: number,
	example: boolean = false,
): Promise<string | null> {
	const getFile = provided == 'input' ? getInputFile : getOutputFile
	const file = await getFile(day, part, example)
	if (!file) return null
	const url = new URL(file, import.meta.url)
	const contents = await Deno.readTextFile(url)
	return contents
}

async function runJSSolution(
	file: string,
	day: number,
	part: number,
	example: boolean = false,
): Promise<string | number | null> {
	const input = await getProvided('input', day, part, example)
	if (!input) return null
	const url = new URL(file, import.meta.url)
	const { solution } = await import(url.href)
	const result = await solution(input)
	return result
}

async function runWATSolution(
	file: string,
	day: number,
	part: number,
	example: boolean = false,
	skipCompilation: boolean = false,
): Promise<number | null> {
	const wasmFile = file.replace(/\.wat$/, '.wasm')
	const input = await getProvided('input', day, part, example)
	if (!input) return null
	if (!skipCompilation) await compileWATSolution(file, wasmFile)
	const url = new URL(wasmFile, import.meta.url)
	const memory = new WebAssembly.Memory({ initial: 10 })
	const log = (i32: number) => console.log(i32)
	const memlog = (start: number, length: number) => {
		console.log(...typedArray.slice(start, start + length))
	}
	const env = { input: memory, log, memlog }
	const encoder = new TextEncoder()
	const typedArray = new Uint8Array(memory.buffer)
	encoder.encodeInto(input, typedArray)
	const wasm = await WebAssembly.instantiateStreaming(fetch(url), { env })
	const solution = wasm.instance.exports.solution as CallableFunction
	return solution()
}

async function compileWATSolution(
	file: string,
	wasmFile: string,
): Promise<void> {
	const args = [file, '-o', wasmFile]
	const cwd = import.meta.dirname + '/'
	const command = new Deno.Command('wat2wasm', { args, cwd })
	const { stderr } = await command.output()
	if (stderr.length > 0) throw Error(String.fromCharCode(...stderr))
}

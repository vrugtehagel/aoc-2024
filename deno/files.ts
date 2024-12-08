/** Retrieve the path for a specific input file. */
export async function getInputFile(
	day: number,
	part: number,
	example?: boolean,
): Promise<string | null> {
	return await getAsset('input', day, part, example ?? false)
}

/** Retrieve the path for a specific output file. */
export async function getOutputFile(
	day: number,
	part: number,
	example?: boolean,
): Promise<string | null> {
	return await getAsset('output', day, part, example ?? false)
}

/** Retrieve the path for a specific solution file. */
export async function getSolutionFile(
	day: number,
	part: number,
): Promise<string | null> {
	let path = `^\.\./day-${day.toString().padStart(2, '0')}`
	path += `/part-${part}\\.(ts|js|wat)$`
	return await get(new RegExp(path))
}

/** Gets a file path for an input or output file for a specific day and part of
 * a challenge. */
async function getAsset(
	provided: 'input' | 'output',
	day: number,
	part: number,
	example?: boolean,
): Promise<string | null> {
	let path = '^\\.\\./aoc-2024-assets'
	path += `/day-${day.toString().padStart(2, '0')}`
	if (example) path += '-example'
	path += `/${provided}(-${part})?\\.txt$`
	return await get(new RegExp(path))
}

/** Gets one file, that matches a given regular expression. This is a quick and
 * somewhat dirty way to allow multiple structures within the challenges. For
 * example, a .ts or a .js extension. Or a shared versus individual inputs. */
async function get(regex: RegExp): Promise<string | null> {
	const files = await getAll()
	return files.find((file) => regex.test(file)) ?? null
}

/** Walks through the project files and returns all paths. Results are cached,
 * so it only does the work once. */
async function getAll(): Promise<string[]> {
	if (cache.length == 0) await walk('..')
	return cache
}

/** Walk through the entire project, caching all file paths */
const cache: string[] = []
async function walk(directory: string): Promise<void> {
	const url = new URL(directory, import.meta.url)
	for await (const { isFile, name } of Deno.readDir(url)) {
		if (name.startsWith('.')) continue
		else if (isFile) cache.push(`${directory}/${name}`)
		else await walk(`${directory}/${name}`)
	}
}

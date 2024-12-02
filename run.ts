const day: number = Number(Deno.args[0])
const dayExists = day > 0 && day <= 31
if (!dayExists) {
	throw Error(`You must specify a day.`)
}
const directory = `./day-${day.toString().padStart(2, '0')}`

console.log('%cPart 1:', 'color: gray')
await import(`${directory}/part-1.ts`)

console.log('%cPart 2:', 'color: gray')
await import(`${directory}/part-2.ts`).catch((error) => {
	if (error.code == 'ERR_MODULE_NOT_FOUND') {
		console.log('%c(not found)', 'color: gray')
	}
	throw error
})

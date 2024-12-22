export async function solution(input: string): number {
	// Each line is a number
	const secrets = new Uint32Array(input.trim().split('\n').map(Number))

	const start = performance.now()
	const adapter = await navigator.gpu.requestAdapter()
	const device = await adapter?.requestDevice()
	if(!device) throw Error('No GPU adapter or device found')

	const url = new URL('./part-2.wgsl', import.meta.url)
	const code = await Deno.readTextFile(url)
	const module = device.createShaderModule({ code })

	const inputBuffer = device.createBuffer({
		mappedAtCreation: true,
		size: secrets.byteLength,
		usage: GPUBufferUsage.STORAGE,
	})
	new Uint32Array(inputBuffer.getMappedRange()).set(secrets)
	inputBuffer.unmap()

	const outputBuffer = device.createBuffer({
		size: 4 * 19 ** 4,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
	})

	const pipeline = device.createComputePipeline({
		layout: 'auto',
		compute: { module, entryPoint: 'main' },
	})

	const group = device.createBindGroup({
		layout: pipeline.getBindGroupLayout(0),
		entries: [
			{ binding: 0, resource: { buffer: inputBuffer } },
			{ binding: 1, resource: { buffer: outputBuffer } },
		],
	})

	const command = device.createCommandEncoder()
	const pass = command.beginComputePass()
	pass.setPipeline(pipeline)
	pass.setBindGroup(0, group)
	pass.dispatchWorkgroups(Math.ceil(secrets.length / 256))
	pass.end()

	const readBuffer = device.createBuffer({
		size: 4 * 19 ** 4,
		usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
	})
	command.copyBufferToBuffer(outputBuffer, 0, readBuffer, 0, 4 * 19 ** 4)

	device.queue.submit([command.finish()])

	await readBuffer.mapAsync(GPUMapMode.READ)
	const result = new Uint32Array(readBuffer.getMappedRange())
	let max = 0
	for(const price of result){
		if(max < price) max = price
	}
	readBuffer.unmap()
	device.destroy()

	return max
}

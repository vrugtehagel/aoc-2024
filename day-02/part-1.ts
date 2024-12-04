export function solution(input: string): number {
	// Parse it into an array of individual reports
	const reports: Array<number[]> = input.trim().split('\n')
		.map((line) => line.split(/\s+/).map((number) => Number(number)))

	// Now count the number of safe reports
	let safeReports = 0
	for (const report of reports) {
		const ascending = report[0] < report[1]
			? [...report]
			: report.toReversed()
		const differences = ascending.slice(0, -1)
			.map((value, index) => ascending[index + 1] - value)
		const safe = differences
			.every((difference) => 1 <= difference && difference <= 3)
		if (safe) safeReports++
	}

	// Done!
	return safeReports
}

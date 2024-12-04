export function solution(input: string): number {
	// Again we parse it into an array of individual reports
	const reports: Array<number[]> = input.trim().split('\n')
		.map((line) => line.split(/\s+/).map((number) => Number(number)))

	// So I tried to be smart here and avoid this naive strategy, but it turns out
	// that that becomes so much more complicated and I don't like that ;)
	// So we just try removing each reading until we find one that makes the report
	// valid. This happens right away if the report was already valid.

	// Count the number of safe reports
	let safeReports = 0
	for (const report of reports) {
		const safe = report.some((_value, index) => {
			const adjusted = report.toSpliced(index, 1)
			if (adjusted[0] > adjusted[1]) adjusted.reverse()
			const differences = adjusted.slice(0, -1)
				.map((value, index) => adjusted[index + 1] - value)
			return differences
				.every((difference) => 1 <= difference && difference <= 3)
		})
		if (safe) safeReports++
	}

	// Done!
	return safeReports
}

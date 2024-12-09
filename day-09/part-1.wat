(module
	(import "env" "input" (memory 1))

	(func (export "solution") (result i64)
		(local $checksum i64)
		(local $step_count i32)
		(local $start_index i32)
		(local $end_index i32)
		(local.set $checksum (i64.const 0))
		(local.set $step_count (i32.const 0))
		(local.set $start_index (i32.const 0))
		(local.set $end_index (call $normalize_and_get_max_index))
		;; We step through the input string.
		loop $walk
			;; If start_index is 0, we need to skip this value. It doesn't
			;; really matter whether it is a gap or not, because nothing gets
			;; added to the checksum, we just increment $start_index, then
			;; continue the loop
			(i32.load8_u (local.get $start_index))
			(if (i32.eqz (i32.load8_u (local.get $start_index))) (then
				(i32.add (local.get $start_index) (i32.const 1))
				local.set $start_index
			))
			(br_if $walk (i32.eqz))
			;; Decrement the number at $start_index (we do this either way)
			local.get $start_index
			(i32.sub (i32.load8_u (local.get $start_index)) (i32.const 1))
			i32.store8
			;; Now, if $start_index is odd, then we're in a "gap"
			(i32.and (local.get $start_index) (i32.const 1))
			(if (result i32) (then ;; The "result" is the unshifted file ID
				;; Decrement the number at $end_index
				local.get $end_index
				(i32.load8_u (local.get $end_index))
				(i32.sub (i32.const 1))
				i32.store8
				;; Since we're in a gap, the checksum needs the "end" file ID
				local.get $end_index
			)(else ;; We're not in a gap
				;; Not in a gap, so we use the "start" file ID
				local.get $start_index
			))
			(i32.shr_u (i32.const 1)) ;; This turns an index into a file ID

			(i32.mul (local.get $step_count))
			i64.extend_i32_s
			(i64.add (local.get $checksum))
			local.set $checksum
			;; If the number at $start_index is "0" (in ASCII, that's 48),
			;; then increment $start_index
			(if (i32.eqz (i32.load8_u (local.get $start_index))) (then
				(i32.add (local.get $start_index) (i32.const 1))
				local.set $start_index
			))
			;; If the number at $end_index is now "0", then (double-)decrement
			;; $end_index (we don't care about "end" gaps)
			(if (i32.eqz (i32.load8_u (local.get $end_index))) (then
				(i32.sub (local.get $end_index) (i32.const 2))
				local.set $end_index
			))
			;; At the end of the step, we increase $step_count by 1
			(i32.add (local.get $step_count) (i32.const 1))
			local.set $step_count
			;; Continue if $start_index <= $end_index
			(i32.le_s (local.get $start_index) (local.get $end_index))
			br_if $walk
		end
		local.get $checksum
	)

	(func $normalize_and_get_max_index (result i32)
		(local $index i32)
		(local $byte i32)
		(local.set $index (i32.const -1))
		loop $searching
			(i32.add (local.get $index) (i32.const 1))
			(i32.load8_u (local.tee $index))
			(i32.sub (i32.const 48))
			local.tee $byte
			(i32.store8 (local.get $index) (local.get $byte))
			(i32.ge_s (i32.const 0))
			br_if $searching
		end
		(i32.sub (local.get $index) (i32.const 1))
	)
)

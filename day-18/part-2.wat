(module
	(import "env" "input" (memory 1))
	(import "env" "log" (func $log (param i32)))
	(import "env" "memlog" (func $memlog (param i32) (param i32)))
	(global $coordinates (mut i32) (i32.const 0))
	(global $width (mut i32) (i32.const 0))

	(func (export "solution") (result i32 i32)
		(local $max_nanoseconds i32)
		(global.set $coordinates (call $normalize_input))
		(global.set $width (call $get_screen_size))

		(call $bitwise_search (i32.mul (global.get $width) (global.get $width)))
		local.tee $max_nanoseconds
		(i32.load8_u (i32.mul (i32.const 2)))
		(i32.mul (local.get $max_nanoseconds) (i32.const 2))
		(i32.load8_u (i32.add (i32.const 1)))
	)

	;; Zeroes in on the maximum number of $nanoseconds in which we and the
	;; historians $can_still_exit. It does so by taking a maximum value, seeing
	;; how many bits it is, then toggling them one-by-one (higher-order bits
	;; first). This means we only have to run the pathfinding algorithm a total
	;; number of ceil(log2($max_value)) times.
	(func $bitwise_search (param $max_value i32) (result i32)
		(local $shifts i32)
		(local $guess i32)
		(local $next_guess i32)
		(i32.sub (i32.const 32) (i32.clz (local.get $max_value)))
		(local.set $shifts (i32.sub (i32.const 1)))
		(loop $guessing
			(i32.shl (i32.const 1) (local.get $shifts))
			(local.tee $next_guess (i32.add (local.get $guess)))
			(if (call $can_still_exit) (then
				(local.set $guess (local.get $next_guess))
			))
			(local.set $shifts (i32.sub (local.get $shifts) (i32.const 1)))
			(br_if $guessing (i32.ge_s (local.get $shifts) (i32.const 0)))
		)
		(return (local.get $guess))
	)

	;; Check if it is still possible to exit after $nanoseconds.
	(func $can_still_exit (param $nanoseconds i32) (result i32)
		(call $reset_grid (local.get $nanoseconds))
		(i32.sub (global.get $width) (i32.const 1))
		(i32.sub (global.get $width) (i32.const 1))
		(i32.and (call $get_at) (i32.const 0x7FFF))
		(if (i32.eqz) (then (return (i32.const 0))))
		(call $set_at (i32.const 0) (i32.const 0) (i32.const 0))
		(loop $scouting (br_if $scouting (call $scout)))
		(i32.sub (global.get $width) (i32.const 1))
		(i32.sub (global.get $width) (i32.const 1))
		(i32.and (call $get_at) (i32.const 0x7FFF))
		(return (i32.ne (i32.const 0x7FFF)))
	)

	;; Goes through the grid once, scouting the cells for a leading "0" bit.
	;; This bit indicates that they are newly updated, and therefore need their
	;; neighbouring cells checked. Each cell is only checked once in a single
	;; run of this function. When neighbours are checked, the updated ones
	;; receive the leading "0" bit, so they may be checked in the next run. The
	;; number of checked cells is then returned, which also means that scouting
	;; is done once a $scout call returns 0.
	(func $scout (result i32)
		(local $updated i32)
		(local $x i32)
		(local $y i32)
		(loop $scouting_x
			(local.set $y (i32.const 0))
			(loop $scouting_y
				(call $check_pixel (local.get $x) (local.get $y))
				(local.set $updated (i32.add (local.get $updated)))
				(local.tee $y (i32.add (local.get $y) (i32.const 1)))            
				(br_if $scouting_y (i32.lt_u (global.get $width)))
			)			
			(local.tee $x (i32.add (local.get $x) (i32.const 1)))            
			(br_if $scouting_x (i32.lt_u (global.get $width)))
		)
		(return (local.get $updated))
	)

	;; Check a cell for a leading "0" bit. If it has one, update its neighbours.
	;; Returns the amount of neighbours updated, and also updates the checked
	;; cell to have a leading "1" bit.
	(func $check_pixel (param $x i32) (param $y i32) (result i32)
		(local $value i32)
		(local.tee $value (call $get_at (local.get $x) (local.get $y)))
		(if (i32.and (i32.const 0x8000)) (then (return (i32.const 0))))
		local.get $x
		local.get $y
		(i32.or (i32.const 0x8000) (local.get $value))
		call $set_at
		(local.set $value (i32.add (local.get $value) (i32.const 1)))
		(i32.add (local.get $x) (i32.const 1))
		(local.get $y)
		(call $set_at_if_lower (local.get $value))
		(i32.sub (local.get $x) (i32.const 1))
		(local.get $y)
		(call $set_at_if_lower (local.get $value))
		(local.get $x)
		(i32.add (local.get $y) (i32.const 1))
		(call $set_at_if_lower (local.get $value))
		(local.get $x)
		(i32.sub (local.get $y) (i32.const 1))
		(call $set_at_if_lower (local.get $value))
		(return (i32.add (i32.add) (i32.add)))
	)

	;; The grid cells are 16-bit integers. So, we need to fill twice the amount
	;; of grid cells in bytes with 0xFF. The number in these cells represent how
	;; many steps you need to do to reach that cell. Since the grid itself is
	;; smaller than 0x7FFF cells, 0x7FFF is effectively always too high. This
	;; makes it easy to crawl and populate the cells with "real" step sizes.
	;; The number of nanoseconds determines how many of the coordinates we draw
	;; into the grid (as 0x80, that is, a zero with a leading "1" bit to
	;; indicate it doesn't need to be checked).
	(func $reset_grid (param $nanoseconds i32)
		(global.get $coordinates)
		(i32.const 0xFF)
		(i32.mul (global.get $width) (global.get $width))
		(i32.mul (i32.const 2))
		memory.fill
		(if (i32.eqz (local.get $nanoseconds)) (then return))
		(loop $pixel_drawing
			(i32.sub (local.get $nanoseconds) (i32.const 1))
			local.tee $nanoseconds
			(i32.mul (i32.const 2))
			i32.load8_u
			(i32.mul (local.get $nanoseconds) (i32.const 2))
			(i32.add (i32.const 1))
			i32.load8_u
			(i32.mul (global.get $width))
			(i32.mul (i32.add) (i32.const 2))
			(i32.add (global.get $coordinates))
			(i32.store16 (i32.const 0x8000))
			(br_if $pixel_drawing (local.get $nanoseconds))
		)
	)

	;; Sets the value of a cell at ($x, $y) to a certain $value, but only if the
	;; current value is more than $value. A boolean is then returned indicating
	;; whether or not the cell was overwritten. Note that, if the cell was
	;; updated, it is missing the leading "1" bit.
	(func $set_at_if_lower
		(param $x i32) (param $y i32) (param $value i32)
	(result i32)
		(call $get_at (local.get $x) (local.get $y))
		(i32.and (i32.const 0x7FFF))
		(if (i32.lt_u (local.get $value)) (then (return (i32.const 0))))
		(call $set_at (local.get $x) (local.get $y) (local.get $value))
		(return (i32.const 1))
	)

	(func $set_at (param $x i32) (param $y i32) (param $value i32)
		(i32.mul (local.get $y) (global.get $width))
		(i32.add (local.get $x))
		(i32.mul (i32.const 2))
		(i32.add (global.get $coordinates))
		(i32.store16 (local.get $value))
	)

	;; Gets the value of the cell at ($x, $y). Returns 0x80 if the parameters
	;; fall outside the grid.
	(func $get_at (param $x i32) (param $y i32) (result i32)
		(i32.lt_s (local.get $x) (i32.const 0))
		(i32.lt_s (local.get $y) (i32.const 0))
		(i32.ge_s (local.get $x) (global.get $width))
		(i32.ge_s (local.get $y) (global.get $width))
		(if (i32.or (i32.or) (i32.or)) (then (return (i32.const 0x8000))))
		(i32.mul (local.get $y) (global.get $width))
		(i32.add (local.get $x))
		(i32.mul (i32.const 2))
		(i32.add (global.get $coordinates))
		(return (i32.load16_u))
	)

	;; Goes through all the (normalized) coordinates, and returns the biggest,
	;; plus one. This is the screen size.
	(func $get_screen_size (result i32)
		(local $index i32)
		(local $max i32)
		(local $current i32)
		(loop $searching
			(if (i32.eq (local.get $index) (global.get $coordinates)) (then
				(return (i32.add (local.get $max) (i32.const 1)))
			))
			(i32.load8_u (local.get $index))
			local.tee $current
			(local.set $index (i32.add (local.get $index) (i32.const 1)))
			(if (i32.gt_s (local.get $max)) (then
				(local.set $max (local.get $current))
			))
			br $searching
		)
		unreachable
	)

	;; Normalizes the input to simple sequential numeric coordinates. These are
	;; 8-bit values and only support single and double digit input coordinates.
	;; It returns the number of coordinates (where (x,y) counts as two)
	(func $normalize_input (result i32)
		(local $raw_index i32)
		(local $max_raw_index i32)
		(local $index i32)
		(local $reading i32)
		(local.set $max_raw_index (call $get_input_length))
		(local.set $index (i32.sub (local.get $max_raw_index) (i32.const 1)))
		(local.set $raw_index (i32.const -1))
		(block $done (loop $relocating
			(i32.add (local.get $raw_index) (i32.const 1))
			local.tee $raw_index
			(br_if $done (i32.ge_u (local.get $max_raw_index)))
			(i32.load8_u (local.get $raw_index))
			local.tee $reading
			(br_if $relocating (i32.le_s (i32.const 44)))
			(local.tee $index (i32.add (local.get $index) (i32.const 1)))
			(i32.store8 (i32.sub (local.get $reading) (i32.const 48)))
			(i32.add (local.get $raw_index) (i32.const 1))
			local.tee $raw_index
			(i32.load8_u (local.get $raw_index))
			local.tee $reading
			(br_if $relocating (i32.le_s (i32.const 44)))
			local.get $index
			(i32.load8_u (local.get $index))
			(i32.mul (i32.const 10))
			(i32.store8 (i32.add (i32.sub (local.get $reading) (i32.const 48))))
			br $relocating
		))
		(i32.sub (local.get $index) (local.get $max_raw_index))
		(local.set $index (i32.add (i32.const 1)))
		(memory.copy (i32.const 0) (local.get $max_raw_index) (local.get $index))
		(return (local.get $index))
	)

	;; How many characters long is the input? We'll use this to relocate the
	;; coordinates to a different part of the memory, and in turn make room for
	;; the "screen" (which must have fewer cells than the input length)
	(func $get_input_length (result i32)
		(local $index i32)
		(loop $walk
			(local.tee $index (i32.add (local.get $index) (i32.const 1)))
			(if (i32.eqz (i32.load8_u)) (then (return (local.get $index))))
			br $walk
		)
		unreachable
	)
)

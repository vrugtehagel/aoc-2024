(module
	(import "env" "input" (memory 1))
	(import "env" "log" (func $log (param i32)))
	(import "env" "memlog" (func $memlog (param i32) (param i32)))
	(global $width (mut i32) (i32.const 0))
	(global $height (mut i32) (i32.const 0))
	(global $instructions (mut i32) (i32.const 0))

	(func (export "solution") (result i32)
		(global.set $width (call $get_width))
		(global.set $height (call $get_height))
		(global.set $instructions (call $get_number_of_instructions))
		call $stretch_map
		(global.set $width (i32.mul (global.get $width) (i32.const 2)))
		call $run_simulation
		call $get_gps_sum
	)

	;; Stretches the map to be twice as wide. First we move the instructions
	;; to make room for the bigger map, then reverse-fill the grid with
	;; duplicated cells. Note that we also duplicate the newlines.
	;; This is not the most memory-efficient way to do it, because we're
	;; occupying 4 times `$height` bytes for no reason (the two doubled walls
	;; and the double newlines). But it should do and is simpler to set up.
	(func $stretch_map
		(local $old_size i32)
		(local $new_size i32)
		(local $index i32)
		(local $cell i32)
		(local $cell_left i32)
		(local $cell_right i32)
		(i32.add (global.get $width) (i32.const 1))
		(i32.mul (i32.const 2))
		(i32.mul (global.get $height))
		local.tee $new_size
		(i32.add (global.get $width) (i32.const 1))
		(i32.mul (global.get $height))
		local.tee $old_size
		(memory.copy (global.get $instructions))
		(local.set $index (local.get $old_size))
		(loop $doubling
			(local.tee $index (i32.sub (local.get $index) (i32.const 1)))
			(local.tee $cell (i32.load8_u))
			(if (i32.eq (i32.const 79)) (then
				(local.set $cell_left (i32.const 91))
				(local.set $cell_right (i32.const 93))
			) (else (if (i32.eq (local.get $cell) (i32.const 64)) (then
				(local.set $cell_left (i32.const 64))
				(local.set $cell_right (i32.const 46))
			) (else
				(local.set $cell_left (local.get $cell))
				(local.set $cell_right (local.get $cell))
			))))
			(i32.mul (local.get $index) (i32.const 2))
			(i32.store8 (local.get $cell_left))
			(i32.add (i32.mul (local.get $index) (i32.const 2)) (i32.const 1))
			(i32.store8 (local.get $cell_right))
			(br_if $doubling (i32.ne (local.get $index) (i32.const 0)))
		)
	)

	;; Run the simulation! Remove the robot from the input data, and walk
	;; through the instructions step-by-step.
	(func $run_simulation
		(local $x i32)
		(local $y i32)
		(local $step i32)
		(i32.add (global.get $width) (i32.const 2))
		(local.set $step (i32.mul (global.get $height)))
		call $seek_robot
		local.set $y
		local.set $x
		(loop $walking
			local.get $x
			local.get $y
			(local.tee $step (i32.add (local.get $step) (i32.const 1)))
			(if (i32.eq (i32.load8_u) (i32.const 10)) (then br $walking))
			(if (i32.eqz (i32.load8_u (local.get $step))) (then return))
			local.get $x
			local.get $y
			(call $instruction_to_delta (i32.load8_u (local.get $step)))
			call $move
			local.set $y
			local.set $x
			br $walking
		)
		unreachable
	)

	;; After the simulation has been run, the boxes (91/93) are all in their
	;; final positions. Here, we go through the grid one last time, spotting
	;; boxes and summing their GPS coordinates. Note that we only need to look
	;; for the "[" (91) because that's what decides the coordinates of a box.
	(func $get_gps_sum (result i32)
		(local $x i32)
		(local $y i32)
		(local $sum i32)
		(loop $seek_y
			(local.set $x (i32.const 0))
			(loop $seek_x
				(call $get_at (local.get $x) (local.get $y))
				(if (i32.eq (i32.const 91)) (then
					local.get $sum
					(i32.add (local.get $x))
					(i32.add (i32.mul (local.get $y) (i32.const 100)))
					local.set $sum
				))
				(local.tee $x (i32.add (local.get $x) (i32.const 1)))
				(br_if $seek_x (i32.lt_u (global.get $width)))
			)
			(local.tee $y (i32.add (local.get $y) (i32.const 1)))
			(br_if $seek_y (i32.lt_u (global.get $height)))
		)
		local.get $sum
	)

	;; Move either horizontally or vertically
	(func $move
		(param $x i32) (param $y i32) (param $delta i32) (param $move_y i32)
	(result i32 i32)
		(if (local.get $move_y) (then
			local.get $x
			local.get $y
			local.get $delta
			(return (call $move_vertical))
		))
		local.get $x
		local.get $y
		local.get $delta
		(return (call $move_horizontal))
	)

	;; Moves the robot horizontally. This only pushes boxes in a row, similar
	;; to part 1.
	(func $move_horizontal
		(param $x i32) (param $y i32) (param $delta i32)
	(result i32 i32)
		(local $original_x i32)
		(local $original_y i32)
		(local $looking_at i32)
		(local.set $original_x (local.get $x))
		(local.set $original_y (local.get $y))
		(loop $stepping
			(local.tee $x (i32.add (local.get $x) (local.get $delta)))
			local.get $y
			(local.tee $looking_at (call $get_at))
			(if (i32.eq (i32.const 35)) (then
				;; There's a wall, so do nothing
				(return (local.get $original_x) (local.get $original_y))
			))
			;; Loop until we find an empty spot to push boxes into
			(br_if $stepping (i32.ne (local.get $looking_at) (i32.const 46)))
		)
		;; Loop back through the boxes, moving them one-by-one
		(loop $move_boxes
			local.get $x
			local.get $y
			(local.tee $x (i32.sub (local.get $x) (local.get $delta)))
			local.get $y
			call $get_at
			call $set_at
			(br_if $move_boxes (i32.ne (local.get $x) (local.get $original_x)))
		)
		(i32.add (local.get $original_x) (local.get $delta))
		local.get $y
	)

	;; Move the robot vertically. This is the complex part, because we can
	;; push entire triangles of boxes forward in a single move. This we do with
	;; the recursive $push_vertical function below.
	(func $move_vertical
		(param $x i32) (param $y i32) (param $delta i32)
	(result i32 i32)
		call $save_grid
		local.get $x
		(i32.add (local.get $y) (local.get $delta))
		local.get $delta
		(if (call $push_vertical) (then
			(return (local.get $x) (i32.add (local.get $y) (local.get $delta)))
		))
		call $restore_grid
		(return (local.get $x) (local.get $y))
	)

	;; Saves the grid to an empty part of the memory, to be restored later
	(func $save_grid
		(local $size i32)
		(i32.add (global.get $width) (i32.const 2))
		(i32.mul (global.get $height))
		local.tee $size
		(i32.add (global.get $instructions))
		(i32.add (i32.const 1))
		i32.const 0
		local.get $size
		memory.copy
	)

	;; Restores a previously saved grid (see $save_grid above)
	(func $restore_grid
		(local $size i32)
		i32.const 0
		(i32.add (global.get $width) (i32.const 2))
		(i32.mul (global.get $height))
		local.tee $size
		(i32.add (global.get $instructions))
		(i32.add (i32.const 1))
		local.get $size
		memory.copy
	)

	;; Recursively pushes boxes vertically. This can fail and corrupt the grid.
	;; It returns 1 if the pushing was successful, and 0 if it has corrupted
	;; the grid.
	(func $push_vertical
		(param $x i32) (param $y i32) (param $delta i32)
	(result i32)
		(local $looking_at i32)
		(call $get_at (local.get $x) (local.get $y))
		local.tee $looking_at
		(if (i32.eq (local.get $looking_at) (i32.const 35)) (then
			(return (i32.const 0))
		))
		(if (i32.eq (local.get $looking_at) (i32.const 46)) (then
			(return (i32.const 1))
		))
		(if (i32.eq (i32.const 93)) (then
			(local.set $x (i32.sub (local.get $x) (i32.const 1)))
		))
		local.get $x
		(local.tee $y (i32.add (local.get $y) (local.get $delta)))
		local.get $delta
		call $push_vertical
		(local.tee $x (i32.add (local.get $x) (i32.const 1)))
		local.get $y
		local.get $delta
		call $push_vertical
		(if (i32.eqz (i32.and)) (then (return (i32.const 0))))
		(call $set_at (local.get $x) (local.get $y) (i32.const 93))
		(local.set $x (i32.sub (local.get $x) (i32.const 1)))
		(call $set_at (local.get $x) (local.get $y) (i32.const 91))
		(local.tee $y (i32.sub (local.get $y) (local.get $delta)))
		(call $set_at (local.get $x) (local.get $y) (i32.const 46))
		(local.set $x (i32.add (local.get $x) (i32.const 1)))
		(call $set_at (local.get $x) (local.get $y) (i32.const 46))
		(return (i32.const 1))
	)

	;; Turns an instruction (^, >, v, <) into a ($delta, $move_vertical) pair.
	;; For example, the ">" instruction would be (1, 0), and "^" would be
	;; (1, -1). The character codes are 94 (^), 62 (>), 118 (v) and 60 (<).
	(func $instruction_to_delta (param $instruction i32) (result i32 i32)
		(if (i32.eq (local.get $instruction) (i32.const 94)) (then
			(return (i32.const -1) (i32.const 1))
		))
		(if (i32.eq (local.get $instruction) (i32.const 62)) (then
			(return (i32.const 1) (i32.const 0))
		))
		(if (i32.eq (local.get $instruction) (i32.const 118)) (then
			(return (i32.const 1) (i32.const 1))
		))
		(if (i32.eq (local.get $instruction) (i32.const 60)) (then
			(return (i32.const -1) (i32.const 0))
		))
		unreachable
	)

	;; We search the grid part of the input for the @-symbol representing the
	;; robot. This has character code 64. Note that we also take out the robot
	;; (replacing it with an empty spot "." (46), because there's no point in
	;; actually simulating it move through the grid (we keep track of the
	;; coordinates anyway).
	(func $seek_robot (result i32 i32)
		(local $x i32)
		(local $y i32)
		(loop $seek_y
			(local.set $x (i32.const 0))
			(loop $seek_x
				(call $get_at (local.get $x) (local.get $y))
				(if (i32.eq (i32.const 64)) (then
					(call $set_at (local.get $x) (local.get $y) (i32.const 46))
					(return (local.get $x) (local.get $y))
				))
				(local.tee $x (i32.add (local.get $x) (i32.const 1)))
				(br_if $seek_x (i32.lt_u (global.get $width)))
			)
			(local.tee $y (i32.add (local.get $y) (i32.const 1)))
			(br_if $seek_y (i32.lt_u (global.get $height)))
		)
		unreachable
	)

	;; Just like in part 1 we don't care about out-of-bound coordinates.
	;; However, now this function is adjusted to only work for the stretched
	;; map (specifically because there are now two newlines at the end of every
	;; row.
	(func $get_at (param $x i32) (param $y i32) (result i32)
		(i32.add (global.get $width) (i32.const 2))
		(i32.mul (local.get $y))
		(i32.add (local.get $x))
		i32.load8_u
	)

	;; Set a value at a certain coordinate. Used for moving boxes around the
	;; map. Do not use before map stretching.
	(func $set_at (param $x i32) (param $y i32) (param $value i32)
		(i32.add (global.get $width) (i32.const 2))
		(i32.mul (local.get $y))
		(i32.add (local.get $x))
		(i32.store8 (local.get $value))
	)

	;; Gets the number of instructions the robot will go through
	(func $get_number_of_instructions (result i32)
		(local $index i32)
		(i32.add (global.get $width) (i32.const 1))
		(i32.mul (global.get $height))
		(i32.add (i32.const 1))
		local.tee $index
		(loop $instructions
			(local.set $index (i32.add (local.get $index) (i32.const 1)))
			(i32.load8_u (local.get $index))
			br_if $instructions
		)
		(i32.sub (local.get $index))
		(i32.mul (i32.const -1))
	)

	;; Get the width of the grid. We leave the newlines in between the grid
	;; rows, so at index `$width`, you'll find a newline (10).
	(func $get_width (result i32)
		(local $x i32)
		(loop $check_x
			(local.tee $x (i32.add (local.get $x) (i32.const 1)))
			i32.load8_u
			(if (i32.le_u (i32.const 10)) (then (return (local.get $x))))
			br $check_x
		)
		unreachable
	)

	;; Check the height. In this puzzle, there's a double newline separating
	;; the grid part of the puzzle and the robot moves, so we look for that
	;; double newline instead of a zero.
	(func $get_height (result i32)
		(local $y i32)
		(local.set $y (i32.const 1))
		(loop $check_y
			(local.tee $y (local.get $y) (global.get $width))
			i32.load8_u
			(if (i32.le_u (i32.const 10)) (then (return (local.get $y))))
			br $check_y
		)
		unreachable
	)
)

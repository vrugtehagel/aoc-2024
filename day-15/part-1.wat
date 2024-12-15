(module
	(import "env" "input" (memory 1))
	(import "env" "log" (func $log (param i32)))
	(import "env" "memlog" (func $memlog (param i32) (param i32)))
	(global $width (mut i32) (i32.const 0))
	(global $height (mut i32) (i32.const 0))

	(func (export "solution") (result i32)
		(global.set $width (call $get_width))
		(global.set $height (call $get_height))
		call $run_simulation
		call $get_gps_sum
	)

	;; Runs the whole robot-walking simulation from start to finish. The robot
	;; is removed from the input data, and said data is modified to move the
	;; boxes until the instructions have all been executed. The robot is NOT
	;; put back into the grid.
	(func $run_simulation
		(local $x i32)
		(local $y i32)
		(local $step i32)
		(i32.add (global.get $width) (i32.const 1))
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
			(call $instruction_to_delta (i32.load8_u (local.get $step)))
			call $move
			local.set $y
			local.set $x
			br $walking
		)
		unreachable
	)

	;; After the simulation has been run, the boxes (79) are all in their final
	;; positions. Here, we go through the grid one last time, spotting boxes
	;; and summing their GPS coordinates.
	(func $get_gps_sum (result i32)
		(local $x i32)
		(local $y i32)
		(local $sum i32)
		(loop $seek_y
			(local.set $x (i32.const 0))
			(loop $seek_x
				(call $get_at (local.get $x) (local.get $y))
				(if (i32.eq (i32.const 79)) (then
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

	;; Moves the robot in a certain direction, if possible, pushing boxes if
	;; there are any. It returns the new ($x, $y) position.
	(func $move
		(param $x i32) (param $y i32) (param $dx i32) (param $dy i32)
	(result i32 i32)
		(local $original_x i32)
		(local $original_y i32)
		(local $looking_at i32)
		(local.set $original_x (local.get $x))
		(local.set $original_y (local.get $y))
		(loop $stepping
			(local.tee $x (i32.add (local.get $x) (local.get $dx)))
			(local.tee $y (i32.add (local.get $y) (local.get $dy)))
			(local.tee $looking_at (call $get_at))
			(if (i32.eq (i32.const 35) (local.get $looking_at)) (then
				;; There's a wall, so we don't modify the grid at all and
				;; return the original ($x, $y)
				(return (local.get $original_x) (local.get $original_y))
			))
			(if (i32.eq (i32.const 46) (local.get $looking_at)) (then
				;; There's room! This empty spot will get a box pushed into it,
				;; and the robot moves "into" the first box's position
				;; So first we fill this spot with a box
				(call $set_at (local.get $x) (local.get $y) (i32.const 79))
				(local.tee $x (i32.add (local.get $original_x) (local.get $dx)))
				(local.tee $y (i32.add (local.get $original_y) (local.get $dy)))
				(call $set_at (i32.const 46))
				(return (local.get $x) (local.get $y))
			))
			;; The only other option is seeing a box (79), so keep looking
			br $stepping
		)
		unreachable
	)

	;; Turns an instruction (^, >, v, <) into an (dx, dy) delta. For example,
	;; the ">" instruction would be (1, 0), and "^" would be (0, -1).
	;; The character codes are 94 (^), 62 (>), 118 (v) and 60 (<).
	(func $instruction_to_delta (param $instruction i32) (result i32 i32)
		(if (i32.eq (local.get $instruction) (i32.const 94)) (then
			(return (i32.const 0) (i32.const -1))
		))
		(if (i32.eq (local.get $instruction) (i32.const 62)) (then
			(return (i32.const 1) (i32.const 0))
		))
		(if (i32.eq (local.get $instruction) (i32.const 118)) (then
			(return (i32.const 0) (i32.const 1))
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

	;; This time, we don't check for out-of-bounds input parameters at all.
	;; We don't need this because the room has a wall around it already, and so
	;; we should run into that before going out of bounds.
	(func $get_at (param $x i32) (param $y i32) (result i32)
		(i32.add (global.get $width) (i32.const 1))
		(i32.mul (local.get $y))
		(i32.add (local.get $x))
		i32.load8_u
	)

	;; Set a value at a certain coordinate. Used for moving boxes around the
	;; map.
	(func $set_at (param $x i32) (param $y i32) (param $value i32)
		(i32.add (global.get $width) (i32.const 1))
		(i32.mul (local.get $y))
		(i32.add (local.get $x))
		(i32.store8 (local.get $value))
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

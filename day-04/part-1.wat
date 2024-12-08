(module
	(import "env" "input" (memory 1))
	(global $width (mut i32) (i32.const 0))
	(global $height (mut i32) (i32.const 0))

	;; This is the solution.
	(func (export "solution") (result i32)
		(local $x i32)
		(local $y i32)
		(local $total i32)
		;; First we compute the width and height of the crossword
		call $get_width
		global.set $width
		call $get_height
		global.set $height
		;; Now we walk through each cell in the crossword
		i32.const 0
		local.set $y
		loop $walk_y
			i32.const 0
			local.set $x
			loop $walk_x
				local.get $x
				local.get $y
				;; We count the number of XMAS's starting at ($x, $y)
				call $count_xmas_starting_at
				local.get $total
				i32.add
				local.set $total
				local.get $x
				i32.const 1
				i32.add
				local.tee $x
				global.get $width
				i32.lt_s
				br_if $walk_x
			end
			local.get $y
			i32.const 1
			i32.add
			local.tee $y
			global.get $height
			i32.lt_s
			br_if $walk_y
		end
		local.get $total
	)

	;; Counts the number of XMAS's starting at ($x, $y)
	(func $count_xmas_starting_at
		(param $x i32)
		(param $y i32)
	(result i32)
		;; We're just checking for each direction if it spells "XMAS"
		local.get $x
		local.get $y
		i32.const -1
		i32.const -1
		call $check_for_xmas_starting_at_in_direction
		local.get $x
		local.get $y
		i32.const 0
		i32.const -1
		call $check_for_xmas_starting_at_in_direction
		local.get $x
		local.get $y
		i32.const 1
		i32.const -1
		call $check_for_xmas_starting_at_in_direction
		local.get $x
		local.get $y
		i32.const 1
		i32.const 0
		call $check_for_xmas_starting_at_in_direction
		local.get $x
		local.get $y
		i32.const 1
		i32.const 1
		call $check_for_xmas_starting_at_in_direction
		local.get $x
		local.get $y
		i32.const 0
		i32.const 1
		call $check_for_xmas_starting_at_in_direction
		local.get $x
		local.get $y
		i32.const -1
		i32.const 1
		call $check_for_xmas_starting_at_in_direction
		local.get $x
		local.get $y
		i32.const -1
		i32.const 0
		call $check_for_xmas_starting_at_in_direction
		;; then we add the "boolean" results
		i32.add
		i32.add
		i32.add
		i32.add
		i32.add
		i32.add
		i32.add
	)

	;; Check if it spells XMAS in a given direction ($x + k*$dx, $y + k*$dy)
	(func $check_for_xmas_starting_at_in_direction
		(param $x i32)
		(param $y i32)
		(param $dx i32)
		(param $dy i32)
	(result i32)
		;; We stack the characters found at the four indexes
		local.get $x
		local.get $y
		call $get_at_coordinates
		local.get $x
		local.get $dx
		i32.add
		local.tee $x
		local.get $y
		local.get $dy
		i32.add
		local.tee $y
		call $get_at_coordinates
		local.get $x
		local.get $dx
		i32.add
		local.tee $x
		local.get $y
		local.get $dy
		i32.add
		local.tee $y
		call $get_at_coordinates
		local.get $x
		local.get $dx
		i32.add
		local.tee $x
		local.get $y
		local.get $dy
		i32.add
		local.tee $y
		call $get_at_coordinates
		;; Then we check if the stack spells "XMAS"
		call $is_xmas
	)

	;; Check if the pass parameters represent "XMAS"
	(func $is_xmas
		(param $first i32)
		(param $second i32)
		(param $third i32)
		(param $fourth i32)
	(result i32)
		local.get $first
		i32.const 88 ;; "X"
		i32.eq
		local.get $second
		i32.const 77 ;; "M"
		i32.eq
		local.get $third
		i32.const 65 ;; "A"
		i32.eq
		local.get $fourth
		i32.const 83 ;; "S"
		i32.eq
		i32.and
		i32.and
		i32.and
	)

	;; Get the character at ($x, $y)
	(func $get_at_coordinates
		(param $x i32)
		(param $y i32)
	(result i32)
		i32.const 0
		local.get $x
		i32.le_s
		local.get $x
		global.get $width
		i32.lt_s
		i32.const 0
		local.get $y
		i32.le_s
		local.get $y
		global.get $height
		i32.lt_s
		i32.and
		i32.and
		i32.and
		if (result i32)
			local.get $x
			local.get $y
			global.get $width
			i32.const 1
			i32.add
			i32.mul
			i32.add
			i32.load
			i32.const 0xFF
			i32.and
		else
			i32.const 0
		end
	)

	;; Calculate the $height of the crossword
	(func $get_height (result i32)
		(local $row i32)
		i32.const 0
		local.set $row
		loop $walk ;; Walk down until we hit 0x00
			local.get $row
			i32.const 1
			i32.add
			local.tee $row
			global.get $width
			i32.const 1
			i32.add
			i32.mul
			i32.load
			i32.const 0xFF
			i32.and
			br_if $walk
		end
		local.get $row
	)

	;; Calculate the $width of the crossword
	(func $get_width (result i32)
		(local $column i32)
		i32.const 0
		local.set $column
		loop $walk ;; Walk right until we hit "\n"
			local.get $column
			i32.const 1
			i32.add
			local.tee $column
			i32.load
			i32.const 0xFF
			i32.and
			i32.const 0x0A ;; "\n"
			i32.ne
			br_if $walk
		end
		local.get $column
	)

)

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
				call $check_x_mas_centered_at
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

	;; Checks if there's an X-MAS centered at ($x, $y)
	;; That is, the "A" should be at ($x,$y)
	(func $check_x_mas_centered_at
		(param $x i32)
		(param $y i32)
	(result i32)
		local.get $x
		local.get $y
		call $get_at_coordinates
		i32.const 65 ;; "A"
		i32.eq
		;; Check if we have an "M" and "S" diagonally
		local.get $x
		i32.const -1
		i32.add
		local.get $y
		i32.const -1
		i32.add
		call $get_at_coordinates
		local.get $x
		i32.const 1
		i32.add
		local.get $y
		i32.const 1
		i32.add
		call $get_at_coordinates
		call $is_m_and_s
		;; Check if we have an "M" and "S" in the other diagonal
		local.get $x
		i32.const -1
		i32.add
		local.get $y
		i32.const 1
		i32.add
		call $get_at_coordinates
		local.get $x
		i32.const 1
		i32.add
		local.get $y
		i32.const -1
		i32.add
		call $get_at_coordinates
		call $is_m_and_s
		;; Only if the center is "A" and both diagonals are "M" and "S"'s
		i32.and
		i32.and
	)

	(func $is_m_and_s
		(param $first i32)
		(param $second i32)
	(result i32)
		local.get $first
		i32.const 77 ;; "M"
		i32.eq
		local.get $first
		i32.const 83 ;; "S"
		i32.eq
		i32.or
		local.get $first
		local.get $second
		i32.add
		i32.const 160 ;; "M" + "S"
		i32.eq
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

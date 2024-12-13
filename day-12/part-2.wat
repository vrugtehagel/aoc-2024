(module
	(import "env" "input" (memory 10))
	;; For the entire field
	(global $width (mut i32) (i32.const 0))
	(global $height (mut i32) (i32.const 0))
	(global $size (mut i32) (i32.const 0)) ;; $width * $height
	;; For temporary copies of regions
	(global $region_width (mut i32) (i32.const 0))
	(global $region_height (mut i32) (i32.const 0))

	(func (export "solution") (result i32)
		(local $x i32)
		(local $y i32)
		(local $price i32)
		(local.set $price (i32.const 0))
		(local.set $y (i32.const 0))
		loop $y_direction
			(local.set $x (i32.const 0))
			loop $x_direction
				(call $get_crop_at (local.get $x) (local.get $y))
				(if (i32.ne (i32.const 0)) (then
					(call $load_region_at (local.get $x) (local.get $y))
					(i32.mul (call $count_fence_lines))
					(local.set $price (i32.add (local.get $price)))
				))
				(local.set $x (i32.add (local.get $x) (i32.const 1)))
				(i32.lt_u (local.get $x) (global.get $width))
				br_if $x_direction
			end
			(local.set $y (i32.add (local.get $y) (i32.const 1)))
			(i32.lt_u (local.get $y) (global.get $height))
			br_if $y_direction
		end
		(return (local.get $price))
	)

	;; Count fence lines in the currently copied region. We actually only
	;; really count the horizontal ones, and then we multiply the result by 2.
	;; Each horizontal fence line is connected to one vertical one (on each
	;; side) anyway so this is a nice optimization we can do
	(func $count_fence_lines (result i32)
		(local $x i32)
		(local $y i32)
		(local $delta i32)
		(local $tracking i32)
		(local $fence_lines i32)
		;; We start at -1, then compare the current cell with the cell below it
		;; At first we're out of the region entirely, but there can be fences
		;; there. At the end of the loop we also check against cells that are
		;; not in the region
		(local.set $y (i32.const -1))
		(local.set $fence_lines (i32.const 0))
		loop $select_line
			(local.set $x (i32.const 0))
			(local.set $delta (i32.const 0))
			(local.set $tracking (i32.const 0))
			loop $walk_line
				(call $get_from_region_at (local.get $x) (local.get $y))
				local.get $x
				(i32.add (local.get $y) (i32.const 1))
				call $get_from_region_at
				(local.tee $delta (i32.sub))
				(i32.ne (i32.const 0))
				(i32.ne (local.get $delta) (local.get $tracking))
				(if (i32.and) (then
					;; New fence line!
					(i32.add (local.get $fence_lines) (i32.const 1))
					local.set $fence_lines
				))
				(local.set $tracking (local.get $delta))
				(local.set $x (i32.add (local.get $x) (i32.const 1)))
				(i32.lt_u (local.get $x) (global.get $region_width))
				br_if $walk_line
			end
			(local.set $y (i32.add (local.get $y) (i32.const 1)))
			(i32.lt_u (local.get $y) (global.get $region_height))
			br_if $select_line
		end
		(i32.mul (local.get $fence_lines) (i32.const 2))
	)

	;; Loads a region from the main field into a smaller box in a clean section
	;; of the memory. The crops are replaced with 0b00000001 (just 1s) in the
	;; copied region, and with zeroes in the main field (which also unmarks
	;; them). We return the area of the copied region (i.e. the 1s)
	(func $load_region_at
		(param $x i32)
		(param $y i32)
	(result i32)
		(local $min_y i32)
		(local $max_x i32)
		(local $max_y i32)
		(local $min_x i32)
		(local $area i32)
		(call $walk_and_mark_region (local.get $x) (local.get $y))
		local.set $min_x
		local.set $max_y
		local.set $max_x
		local.set $min_y
		(local.set $area (i32.const 0))
		(i32.sub (local.get $max_x) (local.get $min_x))
		(i32.add (i32.const 1))
		global.set $region_width
		(i32.sub (local.get $max_y) (local.get $min_y))
		(i32.add (i32.const 1))
		global.set $region_height
		;; Also make sure to reset it, because we re-use the same memory for
		;; this copying, so we need to set the relevant bytes to 0 here
		global.get $size
		i32.const 0
		(i32.mul (global.get $region_width) (global.get $region_height))
		memory.fill
		;; Now we loop through the boxed region
		(local.set $x (i32.const 0))
		loop $x_direction
			(local.set $y (i32.const 0))
			loop $y_direction
				(i32.add (local.get $min_x) (local.get $x))
				(i32.add (local.get $min_y) (local.get $y))
				call $get_crop_at
				;; Crops with the 0b10000000 bit need to be migrated onto the
				;; new region. We set the ($x, $y) position to 1 in the region
				;; and set the respective crop in the main field to 0
				(if (i32.and (i32.const 0x80)) (then
					local.get $x
					local.get $y
					i32.const 1
					call $set_in_region_at
					(i32.add (local.get $min_x) (local.get $x))
					(i32.add (local.get $min_y) (local.get $y))
					i32.const 0
					call $set_crop_at
					(local.set $area (i32.add (local.get $area) (i32.const 1)))
				))
				(local.set $y (i32.add (local.get $y) (i32.const 1)))
				(i32.lt_u (local.get $y) (global.get $region_height))
				br_if $y_direction
			end
			(local.set $x (i32.add (local.get $x) (i32.const 1)))
			(i32.lt_u (local.get $x) (global.get $region_width))
			br_if $x_direction
		end
		local.get $area
	)

	;; This is a recursive function that walks in a crop region and marks the
	;; first four bits of each crop with the first bit, i.e. 0b1xxxxxxx. It
	;; then returns the minimum and maximum values for $x and $y that occur in
	;; the region. This'll help us copy the region into a clean region in the
	;; memory efficiently without additional unnecessary space.
	;; The returned value specifies top - right - bottom - left, like CSS, but
	;; all are relative to the top and left edge (so e.g. top < bottom)
	(func $walk_and_mark_region
		(param $x i32)
		(param $y i32)
	(result i32 i32 i32 i32)
		(local $crop i32)
		(local $min_y i32)
		(local $max_x i32)
		(local $max_y i32)
		(local $min_x i32)
		(local.set $min_x (local.get $x))
		(local.set $max_x (local.get $x))
		(local.set $min_y (local.get $y))
		(local.set $max_y (local.get $y))
		(local.set $crop (call $get_crop_at (local.get $x) (local.get $y)))
		;; Mark this very crop at ($x, $y)
		local.get $x
		local.get $y
		local.get $crop
		(i32.and (i32.const 0x7F))
		(i32.add (i32.const 0x80))
		call $set_crop_at
		;; Try to go left (this fails if the crop's been marked already)
		(local.tee $x (i32.sub (local.get $x) (i32.const 1)))
		local.get $y
		(if (i32.eq (call $get_crop_at) (local.get $crop)) (then
			local.get $x
			local.get $y
			call $walk_and_mark_region
			(local.set $min_x (call $min (local.get $min_x)))
			(local.set $max_y (call $max (local.get $max_y)))
			(local.set $max_x (call $max (local.get $max_x)))
			(local.set $min_y (call $min (local.get $min_y)))
		))
		;; Try to go right
		(local.tee $x (i32.add (local.get $x) (i32.const 2)))
		local.get $y
		(if (i32.eq (call $get_crop_at) (local.get $crop)) (then
			local.get $x
			local.get $y
			call $walk_and_mark_region
			(local.set $min_x (call $min (local.get $min_x)))
			(local.set $max_y (call $max (local.get $max_y)))
			(local.set $max_x (call $max (local.get $max_x)))
			(local.set $min_y (call $min (local.get $min_y)))
		))
		;; Try to go up
		(local.tee $x (i32.sub (local.get $x) (i32.const 1)))
		(local.tee $y (i32.sub (local.get $y) (i32.const 1)))
		(if (i32.eq (call $get_crop_at) (local.get $crop)) (then
			local.get $x
			local.get $y
			call $walk_and_mark_region
			(local.set $min_x (call $min (local.get $min_x)))
			(local.set $max_y (call $max (local.get $max_y)))
			(local.set $max_x (call $max (local.get $max_x)))
			(local.set $min_y (call $min (local.get $min_y)))
		))
		;; Try to go down
		local.get $x
		(local.tee $y (i32.add (local.get $y) (i32.const 2)))
		(if (i32.eq (call $get_crop_at) (local.get $crop)) (then
			local.get $x
			local.get $y
			call $walk_and_mark_region
			(local.set $min_x (call $min (local.get $min_x)))
			(local.set $max_y (call $max (local.get $max_y)))
			(local.set $max_x (call $max (local.get $max_x)))
			(local.set $min_y (call $min (local.get $min_y)))
		))
		;; Return the boundaries of the region
		local.get $min_y
		local.get $max_x
		local.get $max_y
		local.get $min_x
	)

	;; Get a value within a cropped (cut) region. This is separate from the
	;; main field
	(func $get_from_region_at
		(param $x i32)
		(param $y i32)
	(result i32)
		(if (i32.lt_s (local.get $x) (i32.const 0)) (then
			(return (i32.const 0))
		))
		(if (i32.lt_s (local.get $y) (i32.const 0)) (then
			(return (i32.const 0))
		))
		(if (i32.ge_s (local.get $x) (global.get $region_width)) (then
			(return (i32.const 0))
		))
		(if (i32.ge_s (local.get $y) (global.get $region_height)) (then
			(return (i32.const 0))
		))
		(i32.mul (local.get $y) (global.get $region_width))
		(i32.add (local.get $x))
		(i32.add (global.get $size))
		i32.load8_u
	)

	(func $set_in_region_at
		(param $x i32)
		(param $y i32)
		(param $value i32)
	(result)
		(if (i32.lt_s (local.get $x) (i32.const 0)) (then return))
		(if (i32.lt_s (local.get $y) (i32.const 0)) (then return))
		(if (i32.ge_s (local.get $x) (global.get $region_width)) (then return))
		(if (i32.ge_s (local.get $y) (global.get $region_height)) (then return))
		(i32.mul (local.get $y) (global.get $region_width))
		(i32.add (local.get $x))
		(i32.add (global.get $size))
		(i32.store8 (local.get $value))
	)

	;; Get crop (the whole byte) at a certain ($x, $y) coordinate
	(func $get_crop_at
		(param $x i32)
		(param $y i32)
	(result i32)
		(if (i32.lt_s (local.get $x) (i32.const 0)) (then
			(return (i32.const 0))
		))
		(if (i32.lt_s (local.get $y) (i32.const 0)) (then
			(return (i32.const 0))
		))
		(if (i32.ge_s (local.get $x) (global.get $width)) (then
			(return (i32.const 0))
		))
		(if (i32.ge_s (local.get $y) (global.get $height)) (then
			(return (i32.const 0))
		))
		(i32.mul (local.get $y) (global.get $height))
		(i32.add (local.get $x))
		i32.load8_u
	)

	(func $set_crop_at
		(param $x i32)
		(param $y i32)
		(param $value i32)
	(result)
		(if (i32.lt_s (local.get $x) (i32.const 0)) (then return))
		(if (i32.lt_s (local.get $y) (i32.const 0)) (then return))
		(if (i32.ge_s (local.get $x) (global.get $width)) (then return))
		(if (i32.ge_s (local.get $y) (global.get $height)) (then return))
		(i32.mul (local.get $y) (global.get $width))
		(i32.add (local.get $x))
		(i32.store8 (local.get $value))
	)

	;; Get the smaller of two numbers
	(func $min
		(param $a i32)
		(param $b i32)
	(result i32)
		local.get $a
		local.get $b
		(i32.lt_s (local.get $a) (local.get $b))
		select
	)

	;; Get the larger of two numbers
	(func $max
		(param $a i32)
		(param $b i32)
	(result i32)
		local.get $a
		local.get $b
		(i32.gt_s (local.get $a) (local.get $b))
		select
	)

	;; Crops are already marked with a 0b0100000 bit (because they're ASCII
	;; uppercase characters)
	(func $normalize_field (result)
		(local $offset i32)
		(local $source i32)
		(local.set $offset (i32.const 1))
		loop $normalizing
			(i32.add (global.get $width) (i32.const 1))
			(i32.mul (local.get $offset))
			local.tee $source
			(i32.sub (local.get $offset))
			local.get $source
			global.get $width
			memory.copy
			(local.set $offset (i32.add (local.get $offset) (i32.const 1)))
			(i32.lt_s (local.get $offset) (global.get $height))
			br_if $normalizing
		end
		(i32.mul (global.get $width) (local.get $offset))
		i32.const 0
		global.get $height
		memory.fill
	)

	;; Calculate the $width of the field
	(func $get_width (result i32)
		(local $column i32)
		(local.set $column (i32.const 0))
		loop $walk ;; Walk right until we hit "\n"
			(i32.add (local.get $column) (i32.const 1))
			(i32.load8_u (local.tee $column))
			i32.const 0xFF
			i32.and
			i32.const 0x0A ;; "\n"
			i32.ne
			br_if $walk
		end
		local.get $column
	)

	;; Calculate the $height of the field
	(func $get_height (result i32)
		(local $row i32)
		(local.set $row (i32.const 0))
		loop $walk ;; Walk down until we hit 0x00
			(i32.add (local.get $row) (i32.const 1))
			local.tee $row
			(i32.add (global.get $width) (i32.const 1))
			i32.mul
			i32.load8_u
			i32.const 0xFF
			i32.and
			br_if $walk
		end
		local.get $row
	)

	;; Prep $width and $height, and normalize the field
	(start $initialize)
	(func $initialize (result)
		;; First we compute the width and height of the field
		(global.set $width (call $get_width))
		(global.set $height (call $get_height))
		(global.set $size (i32.mul (global.get $width) (global.get $height)))
		call $normalize_field
	)
)

(module
	(import "env" "input" (memory 10))
	(global $width (mut i32) (i32.const 0))
	(global $width_plus_1 (mut i32) (i32.const 0))
	(global $height (mut i32) (i32.const 0))
	(global $start_position (mut i32) (i32.const 0))
	(global $size (mut i32) (i32.const 0))
	(global $max_steps (mut i32) (i32.const 0))

	;; Our solution
	(func (export "solution") (result i32)
		(local $loop_inducing_obstacles i32)
		(local $position i32)
		(local.set $loop_inducing_obstacles (i32.const 0))
		(local.set $position (i32.const 0))
		loop $try_obstacles
			;; Is this a loop-inducing obstacle position?
			(call $place_obstacle_and_walk (local.get $position))
			local.get $loop_inducing_obstacles
			i32.add
			local.set $loop_inducing_obstacles
			;; $position++
			(local.tee $position (i32.add (local.get $position) (i32.const 1)))
			global.get $size
			i32.le_s
			br_if $try_obstacles
		end
		local.get $loop_inducing_obstacles
	)

	;; Try an obstacle at $position. Returns 1 if it results in a loop, and 0
	;; otherwise.
	(func $place_obstacle_and_walk
		(param $position i32)
	(result i32)
		(local $direction i32)
		(i32.mul (global.get $size) (i32.const 2))
		local.get $position
		i32.add
		i32.load8_u
		;; It's not a walkable position
		(i32.and (local.tee $direction) (i32.const 0xF0))
		(if (then (return (i32.const 0))))
		;; She's never been here, so placing something here chances nothing
		(i32.eqz (local.get $direction))
		(if (then (return (i32.const 0))))
		;; It's the starting position; cen't place an obstacle there
		(i32.eq (local.get $position) (global.get $start_position))
		(if (then (return (i32.const 0))))
		;; Run the simulation!
		call $reset_room
		(i32.store8 (local.get $position) (i32.const 0x10))
		local.get $position
		;; Turn around
		local.get $direction
		call $turn_right
		call $turn_right ;; turn around, walking back one step
		call $get_next_position
		local.get $direction
		call $walk_the_room
	)

	;; Walks the room for the first time, marking the right bits in the cells
	;; that the guard visits. It returns a boolean indicating whether or not
	;; she got stuck in a loop.
	(func $walk_the_room
		(param $position i32)
		(param $direction i32)
	(result i32)
		(local $step_count i32)
		(local.set $step_count (i32.const 0))
		loop $walking
			local.get $position
			(call $orient (local.get $position) (local.get $direction))
			local.tee $direction
			(local.tee $position (call $get_next_position))
			(if (call $has_left) (then (return (i32.const 0))))
			;; If we've been here before, then we're looping
			;; This way of detecting whether or not we're done is not
			;; waterproof; there are ways in which we can end up in a loop
			;; that only includes visited tiles that were initially visited in
			;; a different direction than how the guard goes through the loop:
			;;   ......#.....
			;;   .....#.##...
			;;   ..#..#...#..
			;;   .#.###..#...
			;;   .#......#...
			;;   #....##.###.
			;;   .###.##....#
			;;   ...#......#.
			;;   .....^.##.#.
			;;   ...#.#...#..
			;;   ....#.......
			;; This is pretty nasty, but since it's very unlikely to happen,
			;; we don't need to adjust our strategy. We just also count the
			;; number of steps that the guard is doing, and if it's more than
			;; the size of the map times 4 plus 1 (visiting each cell once from
			;; each direction, then doing another step) then we know for sure
			;; she's looping. This is mad inefficient if it happens, but since
			;; it's unlikely, we're good
			(call $has_been_here (local.get $position) (local.get $direction))
			(if (then (return (i32.const 1))))
			(call $mark_visited (local.get $position) (local.get $direction))
			;; Step count as a fallback
			(i32.add (local.get $step_count) (i32.const 1))
			local.tee $step_count
			global.get $max_steps
			i32.le_s
			br_if $walking
		end
		i32.const 1
	)

	;; Marks the position as visited, if it wasn't already
	(func $mark_visited
		(param $position i32)
		(param $direction i32)
	(result)
		(i32.load8_u (local.get $position))
		i32.const 0x0F
		i32.and
		(if (then return))
		local.get $position
		(i32.load8_u (local.get $position))
		local.get $direction
		i32.add ;; Set the direction bit on the cell
		i32.store8
	)

	;; Takes a $position and a $direction, returns the new direction that the
	;; guard will be facing. 0x08 is "up", 0x04 is "right", etcetera.
	(func $orient
		(param $position i32)
		(param $direction i32)
	(result i32)
		loop $turning
			(call $look_ahead (local.get $position) (local.get $direction))
			(if (call $can_move) (then (return (local.get $direction))))
			(local.set $direction (call $turn_right (local.get $direction)))
			br $turning
		end
		unreachable
	)

	(func $turn_right
		(param $direction i32)
	(result i32)
		(i32.shr_u (local.get $direction) (i32.const 1))
		(if (i32.eqz (local.tee $direction)) (then
			(return (i32.const 0x08))
		))
		local.get $direction
	)

	;; Can the guard move to the cell in front of her?
	(func $can_move
		(param $cell i32)
	(result i32)
		;; The "crate" bit is the only one that can stop the guard
		;; We don't stop at the wall, because she should be able to leave
		(i32.ne (local.get $cell) (i32.const 0x10))
	)

	;; Has the guard left the room?
	(func $has_left
		(param $position i32)
	(result i32)
		;; The "crate" bit is the only one that can stop the guard
		;; We don't stop at the wall, because she should be able to leave
		(i32.load8_u (local.get $position))
		i32.const 0x20 ;; The "wall" bit is on
		i32.and
	)

	;; Has the guard been here before in this orientation?
	;; If so - we're in a loop!
	(func $has_been_here
		(param $position i32)
		(param $direction i32)
	(result i32)
		(i32.load8_u (local.get $position))
		local.get $direction
		;; We don't need to worry about bit 2 and 3 because the guard can't
		;; walk through crates and if she left the room then we don't need to
		;; care if she's been "here"
		i32.eq
	)

	;; Returns whatever cell the guard is currently looking at
	(func $look_ahead
		(param $position i32)
		(param $direction i32)
	(result i32)
		(call $get_next_position (local.get $position) (local.get $direction))
		i32.load8_u
	)

	;; Gets the next position given a $position and $direction
	(func $get_next_position
		(param $position i32)
		(param $direction i32)
	(result i32)
		;; Up
		(if (i32.eq (local.get $direction) (i32.const 0x08)) (then
			(if (i32.le_s (local.get $position) (global.get $width)) (then
				;; This is just inside the wall
				;; Not quite the right spot, but that doesn't matter
				(return (global.get $width))
			))
			(return (i32.sub (local.get $position) (global.get $width_plus_1)))
		))
		;; Down
		(if (i32.eq (local.get $direction) (i32.const 0x02)) (then
			(i32.sub (global.get $size) (global.get $width_plus_1))
			local.get $position
			i32.le_s
			;; Again this is not the right spot inside the wall but that's okay
			(if (then (return (global.get $width))))
			(return (i32.add (local.get $position) (global.get $width_plus_1)))
		))
		;; Right
		(if (i32.eq (local.get $direction) (i32.const 0x04)) (then
			;; No additional conditions, the guard can't fall off the room the
			;; wrong way when going to the right
			(return (i32.add (local.get $position) (i32.const 1)))
		))
		;; Left
		;; Only if $position == 0 can this go wrong
		(if (local.get $position) (then
			(return (i32.sub (local.get $position) (i32.const 1)))
		))
		;; If $position == 0 we once again go to this spot inside the wall
		global.get $width
	)



	;; Gets the starting position (as an index) and normalize the whole room
	;; Each cell is described by 8 bits:
	;; Byte 0: (Unused)
	;; Byte 1: (Unused)
	;; Byte 2: Is a row separation cell (can be visited, kind of)
	;; Byte 3: Is a crate (cannot be visited)
	;; Byte 4: Is visited, from the cell below it
	;; Byte 5: Is visited, from the cell to the left of it
	;; Byte 6: Is visited, from the cell above it
	;; Byte 7: Is visited, from the cell to the right of it
	(func $normalize_and_get_start_position (result i32)
		(local $position i32)
		(local $character i32)
		(local $start_position i32)
		(local.set $position (i32.const -1))
		loop $walk
			(i32.add (local.get $position) (i32.const 1))
			(i32.load8_u (local.tee $position))
			i32.const 0xFF
			i32.and
			(if (i32.eq (local.tee $character) (i32.const 0x5E)) (then
				(local.set $start_position (local.get $position))
			))
			local.get $position
			(call $normalize_cell (local.get $character))
			i32.store8
			local.get $character
			br_if $walk
		end
		local.get $start_position
	)

	;; Normalizes a cell to 8 bits, see $normalize_and_get_starting_position
	(func $normalize_cell
		(param $character i32)
	(result i32)
		;; "\n" (0x0A) -> 0x20
		(i32.eq (local.get $character) (i32.const 0x0A))
		(if (then (return (i32.const 0x20))))
		;; "#" (0x23) -> 0x10
		(i32.eq (local.get $character) (i32.const 0x23))
		(if (then (return (i32.const 0x10))))
		;; "." (0x2E) ->  0x00
		;; "^" (0x5E) -> 0x00 ??
		i32.const 0x00
	)

	;; Calculate the $width of the room
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

	;; ;; Calculate the $height of the room
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

	(func $reset_room (result)
		(memory.copy (i32.const 0) (global.get $size) (global.get $size))
	)

	(start $initialize)
	(func $initialize (result)
		;; First we compute the width and height of the room
		(global.set $width (call $get_width))
		(global.set $width_plus_1 (i32.add (global.get $width) (i32.const 1)))
		(global.set $height (call $get_height))
		;; The start position, i.e. the "^"
		(global.set $start_position (call $normalize_and_get_start_position))
		(i32.mul (global.get $width_plus_1) (global.get $height))
		global.set $size
		(global.set $max_steps (i32.mul (global.get $size) (i32.const 4)))
		;; We copy the empty board for later
		(memory.copy (global.get $size) (i32.const 0) (global.get $size))
		;; For the first time we let the guard walk through the room without
		;; adding an extra obstacle.
		(call $walk_the_room (global.get $start_position) (i32.const 0x08))
		drop ;; There's a zero on the stack because she didn't get stuck
		;; Copy this one, too
		(i32.mul (global.get $size) (i32.const 2))
		i32.const 0
		global.get $size
		memory.copy
		call $reset_room
	)

)
# Advent of Code 2024

Let's try and see how far I can get in
[Advent of Code](https://adventofcode.com/) using [Deno](https://deno.com/)!

```
           -***=.
         :*#####*:                                     *
        -****###*+.:.                  .
       -@@@@@@@@@..:!                .# %.           @@@.
      @@*.=%=.+%@@@                  #   #   .#@.   #:  #
     @%:. *%=   .-#@@                @@@@@  #-  -@  @
    @#:           :#@                @   @  @.  .@  #. .%
   @*:  ..       .=%@                @   #   #%=#    %@@
  @#-   .*=::.::=%@@
 @@=     .%@@@@@
 @#:     *@                                *
@@+     :@@
@%=     =@                                                   *
@%-     =@               *
@%-     -@
@%=     .%@
@%+      :@@              @@@@@
 @*.      .%@       @@@*=-:::::-+#@@@
 @%-       .-%@@@@%=:..           ...=%@@         *
  @*.                                  .-%@
  @@=.                                   .-#@@
   @@=.                                    .-#@@             @@@@
    @@=.                                     .:+%@@@      @@@++@@
     @@+.                                       ..:-=++++=-:.-%@
       @%:                                                 .*@@
        @@#-.                                           .-*%@
          @@%#=.                                   .:-*#%@@
            @@@%%#-.      .:---:        .#*****##%%@@@@
             @%=.=#+.     .-@@@#:       .#@@@@
              @#: -#-.     :%@*+*:      .+@
               @*:.**.     :#@@#%#:     .=@
                @@@@@=:...:=@@ @@@#-::::-*@
                    @@@@@@@@@     @@@@@@@@
```

Solutions are written in TypeScript or WASM. The latter can be written in `.wat`
files and are compiled automatically, but require `wat2wasm` to be installed.
However, `.wasm` files are committed to the repository, which Deno can run, so
`wat2wasm` is _not_ necessary to run the existing WASM solutions.

The tasks available are:

- `deno task day [day]` to run the solution for a specific day. Here, `[day]`
  should be replaced with the day number (e.g. `deno task day 3`). It then runs
  each solution, for both parts, both example and real inputs, and compares them
  against the specified output files, if any.
- `deno task test` runs all solutions against the real inputs. If an output is
  not given, the test is skipped. This task runs on commits to `main`.

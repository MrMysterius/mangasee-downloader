import { parse } from "https://deno.land/std@0.174.0/flags/mod.ts";
import * as Color from "https://deno.land/std@0.174.0/fmt/colors.ts";

const ARGS = parse(Deno.args);

switch (ARGS._[0] || undefined) {
  default:
    console.log(Color.red("# No Command Supplied - Aborting #"));
}

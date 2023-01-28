import { parse } from "https://deno.land/std@0.174.0/flags/mod.ts";
import * as Color from "https://deno.land/std@0.174.0/fmt/colors.ts";
import { searchAnime } from "./search.ts";

const ARGS = parse(Deno.args);

switch (ARGS._[0] || undefined) {
  case "search": {
    if (ARGS._.length <= 1) break;
    const res = await searchAnime(ARGS._.slice(1, ARGS._.length).join(" "));
    for (const item of res) {
      if (item.score > 0.05) continue;
      console.log(`${Color.white("-")} ${Color.green(item.item.s)} [ ${Color.blue(item.item.i)} ]`);
    }
    break;
  }
  default:
    console.log(Color.red("# No Command Supplied - Aborting #"));
}

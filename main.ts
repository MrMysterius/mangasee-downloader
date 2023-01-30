import { parse } from "https://deno.land/std@0.174.0/flags/mod.ts";
import * as Color from "https://deno.land/std@0.174.0/fmt/colors.ts";
import { searchAnime } from "./search.ts";
import { getBasicMetadata } from "./metadata.ts";

const ARGS = parse(Deno.args);

switch (ARGS._[0] || undefined) {
  case "search": {
    if (ARGS._.length <= 1) break;

    const results = await searchAnime(ARGS._.slice(1, ARGS._.length).join(" "), parseInt(ARGS.l) || parseInt(ARGS["limit"]) || 5);

    for (const result of results) {
      if (result.score > (parseInt(ARGS.s) || parseInt(ARGS["score-threshold"]) || 0.05)) continue;

      let release_year = "";
      let chapters_available = "";

      if (!ARGS["no-metadata"] && !ARGS.n) {
        const metadata = await getBasicMetadata(result.item.i);
        release_year = metadata?.release_year || "";
        chapters_available = metadata?.chapters_available.toString() || "";
      }
      console.log(
        `${Color.white("-")} ${release_year != "" ? Color.cyan(release_year + " ") : ""}${Color.green(result.item.s)}${
          chapters_available != "" ? Color.magenta(" #" + chapters_available) : ""
        } [ ${Color.yellow(result.item.i)} ]`
      );
    }
    break;
  }
  default:
    console.log(Color.red("# No Command Supplied - Aborting #"));
    break;
}

export function zeroSpaceOut(number: string | number, spaces: number) {
  const number_string = number.toString();
  if (number_string.length >= spaces) return number_string;
  return "0".repeat(spaces - number_string.length) + number_string;
}

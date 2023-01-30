import { parse } from "https://deno.land/std@0.174.0/flags/mod.ts";
import * as Color from "https://deno.land/std@0.174.0/fmt/colors.ts";
import { searchAnime } from "./search.ts";
import { Chapter, getBasicMetadata, getFullMetadata } from "./metadata.ts";
import { download, chaptersSort, findChapter } from "./download.ts";
import { loadProgress } from "./progress.ts";
import { join } from "https://deno.land/std@0.174.0/path/mod.ts";

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
  case "download": {
    if (!ARGS._[1]) break;

    const metadata = await getFullMetadata(ARGS._[1] as string);
    if (metadata == null) break;
    metadata.chapters = chaptersSort(metadata.chapters);

    const progress = loadProgress(join(Deno.cwd(), ARGS._[1] as string));
    const start_part = ARGS.s?.toString().split(".") || ARGS["start"]?.toString().split(".") || null;
    const end_part = ARGS.e?.toString().split(".") || ARGS["end"]?.toString().split(".") || null;

    let start: Chapter = { pretype: 0, main: 0, sub: 0, raw: "" };
    let end: Chapter = { pretype: 0, main: 0, sub: 0, raw: "" };
    let current: Chapter = { pretype: 0, main: 0, sub: 0, raw: "" };

    if (progress != undefined) {
      start = progress.start;
      end = progress.end;
      current = progress.current;
    }

    if (start_part != null) {
      let c: Chapter = start;
      switch (start_part.length) {
        case 3:
          c = { pretype: start_part[0], main: start_part[1], sub: start_part[2], raw: `${start_part[0]}${zeroSpaceOut(start_part[1], 4)}${start_part[2]}` };
          break;
        case 2:
          c = { pretype: 1, main: start_part[0], sub: start_part[1], raw: `1${zeroSpaceOut(start_part[0], 4)}${start_part[1]}` };
          break;
        case 1:
          c = { pretype: 1, main: start_part[0], sub: 0, raw: `1${zeroSpaceOut(start_part[0], 4)}0` };
          break;
      }
      if (start.raw != c.raw) {
        start = c;
        current = start;
      }
    } else if (progress == undefined) {
      start = metadata.chapters[0];
      current = metadata.chapters[0];
    }

    if (end_part != null) {
      let c = end;
      switch (end_part.length) {
        case 3:
          c = { pretype: end_part[0], main: end_part[1], sub: end_part[2], raw: `${end_part[0]}${zeroSpaceOut(end_part[1], 4)}${end_part[2]}` };
          break;
        case 2:
          c = { pretype: 1, main: end_part[0], sub: end_part[1], raw: `1${zeroSpaceOut(end_part[0], 4)}${end_part[1]}` };
          break;
        case 1:
          c = { pretype: 1, main: end_part[0], sub: 0, raw: `1${zeroSpaceOut(end_part[0], 4)}0` };
          break;
      }
      if (end.raw != c.raw) {
        const find_end = findChapter(metadata.chapters, end);
        const find_c = findChapter(metadata.chapters, c);
        if (find_end == null) {
          end = c;
        } else if (find_c != null && find_end.index <= find_c.index) {
          end = c;
        } else if (find_c != null && find_end.index > find_c.index) {
          end = c;
          current = start;
        }
      }
    } else if (progress == undefined) {
      end = metadata.chapters[metadata.chapters.length - 1];
    }

    console.log(Color.green("# Starting Download #"));
    console.log(Color.magenta(`Manga: ${metadata.basic.title}`));
    console.log(Color.yellow(`Author(s): ${metadata.basic.authors.join(", ")}`));
    console.log(Color.cyan(`Genre(s): ${metadata.basic.genres.join(", ")}`));

    console.log(Color.bold("\nFrom:\t\t"), Color.blue(`v${start.pretype} - c${zeroSpaceOut(start.main, 4)}.${start.sub}`));
    console.log(Color.bold("To:\t\t"), Color.brightYellow(`v${end.pretype} - c${zeroSpaceOut(end.main, 4)}.${end.sub}`));
    console.log(Color.bold("Continuing:\t"), Color.brightRed(`v${current.pretype} - c${zeroSpaceOut(current.main, 4)}.${current.sub}`));

    console.log(Color.gray("\n----------------------------------------"));

    await download(ARGS._[1] as string, metadata.basic, Deno.cwd(), metadata.chapters, start, end, current);

    console.log(Color.green("# Finished Download #"));

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

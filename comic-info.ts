import { join } from "https://deno.land/std@0.174.0/path/mod.ts";
import { BasicMangaMetadata, Chapter } from "./metadata.ts";

export interface PageInfo {
  index: number;
  size: number;
  filename: string;
}

export function writeComicInfo(folder_path: string, metadata: BasicMangaMetadata, chapter_info: Chapter, pages: PageInfo[]): boolean {
  const FILE_PATH = join(folder_path, "ComicInfo.xml");
  const Encoder = new TextEncoder();

  Deno.writeFileSync(FILE_PATH, Encoder.encode(`<?xml version="1.0"?>\n`), { create: true, append: false });
  Deno.writeFileSync(
    FILE_PATH,
    Encoder.encode(`<ComicInfo xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\n`),
    { create: false, append: true }
  );

  Deno.writeFileSync(
    FILE_PATH,
    Encoder.encode(
      `\t<Title>${metadata.title} - Chapter ${chapter_info.pretype} ${chapter_info.main}${chapter_info.sub ? `.${chapter_info.sub}` : ""}</Title>\n`
    ),
    {
      create: false,
      append: true,
    }
  );
  Deno.writeFileSync(FILE_PATH, Encoder.encode(`\t<Series>${metadata.title}</Series>\n`), { create: false, append: true });
  Deno.writeFileSync(FILE_PATH, Encoder.encode(`\t<Number>${chapter_info.main}</Number>\n`), { create: false, append: true });
  Deno.writeFileSync(FILE_PATH, Encoder.encode(`\t<Volume>${chapter_info.pretype}</Volume>\n`), { create: false, append: true });
  if (chapter_info.sub != 0)
    Deno.writeFileSync(FILE_PATH, Encoder.encode(`\t<AlternateNumber>${chapter_info.sub}</AlternateNumber>\n`), { create: false, append: true });
  Deno.writeFileSync(FILE_PATH, Encoder.encode(`\t<Notes>Downloaded/Scrapped with Mangasee123 Downloader from MrMysterius</Notes>\n`), {
    create: false,
    append: true,
  });
  Deno.writeFileSync(FILE_PATH, Encoder.encode(`\t<Year>${metadata.release_year}</Year>\n`), { create: false, append: true });
  Deno.writeFileSync(FILE_PATH, Encoder.encode(`\t<Writer>${metadata.authors.join(",")}</Writer>\n`), { create: false, append: true });
  Deno.writeFileSync(FILE_PATH, Encoder.encode(`\t<Genre>${metadata.genres.join(",")}</Genre>\n`), { create: false, append: true });
  Deno.writeFileSync(FILE_PATH, Encoder.encode(`\t<PageCount>${pages.length}</PageCount>\n`), { create: false, append: true });
  Deno.writeFileSync(FILE_PATH, Encoder.encode(`\t<AgeRating>Unknown</AgeRating>\n`), { create: false, append: true });

  Deno.writeFileSync(FILE_PATH, Encoder.encode(`\t<Pages>\n`), { create: false, append: true });

  for (const page of pages) {
    Deno.writeFileSync(FILE_PATH, Encoder.encode(`\t\t<Page Image="${page.index}" ImageSize="${page.size}" />\n`), {
      create: false,
      append: true,
    });
  }

  Deno.writeFileSync(FILE_PATH, Encoder.encode(`\t</Pages>\n`), { create: false, append: true });

  Deno.writeFileSync(FILE_PATH, Encoder.encode(`</ComicInfo>\n`), { create: false, append: true });

  return true;
}

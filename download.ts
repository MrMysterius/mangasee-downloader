import { BasicMangaMetadata, Chapter } from "./metadata.ts";
import { PageInfo } from "./comic-info.ts";
import { join } from "https://deno.land/std@0.174.0/path/mod.ts";
import { saveProgress } from "./progress.ts";
import { writeComicInfo } from "./comic-info.ts";
import { archive } from "./archive.ts";

const BASE_CHAPTER_URL = "https://mangasee123.com/read-online/";

export async function getChapterPage(mangaIndexName: string, chapter: Chapter) {
  if (chapter.pretype == 1) {
    const res = await fetch(`${BASE_CHAPTER_URL}${mangaIndexName}-chapter-${chapter.main}${chapter.sub != 0 ? chapter.sub : ""}.html`);
    return await res.text();
  } else {
    const res = await fetch(
      `${BASE_CHAPTER_URL}${mangaIndexName}-chapter-${chapter.main}${chapter.sub != 0 ? `.${chapter.sub}` : ""}-index-${chapter.pretype}.html`
    );
    return await res.text();
  }
}

interface ChapterInfo {
  Chapter: string;
  Page: string;
  Directory: string;
}

export function extractChapterInfo(html_document: string): ChapterInfo | null {
  const match = html_document.match(/vm\.CurChapter = (.+);/m);
  return JSON.parse(match?.[1] || "") || null;
}

export function extractHost(html_document: string) {
  const match = html_document.match(/vm\.CurPathName = "(.+)";/m);
  return match?.[1] || null;
}

export async function downloadChapter(mangaIndexName: string, chapter: Chapter, folder_path: string): Promise<PageInfo[] | null> {
  const html_document = await getChapterPage(mangaIndexName, chapter);
  const chapter_info = extractChapterInfo(html_document);
  const host = extractHost(html_document);

  if (chapter_info == null || host == null) return null;

  let chapter_number = "";
  const main_number_string = chapter.main.toString();
  if (main_number_string.length <= 4) {
    chapter_number = "0".repeat(4 - main_number_string.length) + main_number_string;
  } else {
    chapter_number = main_number_string;
  }
  if (chapter.sub != 0) {
    chapter_number += `.${chapter.sub}`;
  }

  const DIRECTORY_STRING = chapter_info.Directory != "" ? `${chapter_info.Directory}/` : "";
  const CHAPTER_PREFIX = `${chapter_number}-`;
  const BASE_DOWNLOAD_URL = `https://${host}/manga/${mangaIndexName}/${DIRECTORY_STRING}${CHAPTER_PREFIX}`;

  const pages: PageInfo[] = [];

  const page_count = parseInt(chapter_info.Page);
  for (let i = 1; i <= page_count; i++) {
    let page_number = "";
    const i_string = i.toString();
    if (i_string.length <= 3) {
      page_number = "0".repeat(3 - i_string.length) + i_string;
    } else {
      page_number = i_string;
    }

    const res = await fetch(`${BASE_DOWNLOAD_URL}${page_number}.png`);
    const file = await Deno.open(join(folder_path, `${i}.png`), { create: true, write: true });

    await res.body?.pipeTo(file.writable);
    try {
      file.close();
    } catch (_e) {}
    const size = parseInt(res.headers.get("content-length") as string);

    pages.push({ index: i - 1, filename: `${i}.png`, size: size });
  }

  return pages;
}

export async function download(
  mangaIndexName: string,
  metadata: BasicMangaMetadata,
  folder_path: string,
  chapters: Chapter[],
  start: Chapter,
  end: Chapter,
  current: Chapter | null = null
) {
  const BASE_FOLDER_PATH = join(folder_path, mangaIndexName);
  Deno.mkdirSync(BASE_FOLDER_PATH, { recursive: true });

  if (current == null) current = start;
  if (!(findChapter(chapters, current).length > 1)) return false;

  chapters = chaptersSort(chapters);
  let init = true;

  for (let chapter of chapters) {
    if (chapter.raw != current.raw && init) {
      continue;
    }
    init = false;

    current = chapter;
    saveProgress(BASE_FOLDER_PATH, { current: current, start: start, end: end });

    const CHAPTER_PATH = join(BASE_FOLDER_PATH, `${mangaIndexName}-v${current.pretype}-c${current.main}${current.sub != 0 ? `.${current.sub}` : ""}`);
    Deno.mkdirSync(CHAPTER_PATH, { recursive: true });
    const pages = await downloadChapter(mangaIndexName, current, CHAPTER_PATH);
    if (pages == null) return false;

    if (!writeComicInfo(CHAPTER_PATH, metadata, current, pages)) return false;
    if (!(await archive(CHAPTER_PATH, `${CHAPTER_PATH}.cb7`))) return false;

    if (chapter.raw == end.raw) break;
  }

  return true;
}

export interface PartChapter {
  pretype: number;
  main: number;
  sub: number;
}

export function findChapter(chapters: Chapter[], search: PartChapter) {
  return chapters.filter((chapter) => chapter.pretype == search.pretype && chapter.main == search.main && chapter.sub == search.sub);
}

export function chaptersSort(chapters: Chapter[]) {
  return chapters.sort((a, b) => parseInt(a.raw) - parseInt(b.raw));
}

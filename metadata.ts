import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts";

const MANGA_BASEURL = "https://mangasee123.com/manga/";
const NOT_FOUND_STRING = "We're sorry, the page you rquested could not be found.";

export async function getMangaPage(mangaIndexName: string) {
  const res = await fetch(MANGA_BASEURL + mangaIndexName);
  return await res.text();
}

export interface BasicMangaMetadata {
  title: string;
  authors: string[];
  genres: string[];
  type: string;
  release_year: string;
  ongoing: boolean;
  description: string;
  chapters_available: number;
}

export async function getBasicMetadata(mangaIndexName: string) {
  const html_document = await getMangaPage(mangaIndexName);
  return extractMetadata(html_document);
}

export function extractMetadata(html_document: string) {
  const document = new DOMParser().parseFromString(html_document, "text/html");

  if (document == null || document?.querySelector(".top-15.bottom-15")?.innerText.includes(NOT_FOUND_STRING)) return undefined;

  const metadata_list = document.querySelector(".list-group.list-group-flush");
  if (metadata_list == null) return undefined;

  const metadata: BasicMangaMetadata = {
    title: metadata_list.querySelector("h1")?.innerText as string,
    authors: [],
    genres: [],
    type: "",
    release_year: "",
    ongoing: true,
    description: "",
    chapters_available: JSON.parse(html_document.match(/vm\.Chapters = (.+);/m)?.[1] || "[]")?.length || 0,
  };

  for (const child of metadata_list.children || []) {
    const label = child.querySelector(".mlabel");

    switch (label?.innerText) {
      case "Author(s):": {
        child.querySelectorAll("a").forEach((a) => {
          metadata.authors.push(a.innerText);
        });
        continue;
      }
      case "Genre(s):": {
        child.querySelectorAll("a").forEach((a) => {
          metadata.genres.push(a.innerText);
        });
        continue;
      }
      case "Type:": {
        metadata.type = child.querySelector("a")?.innerText as string;
        continue;
      }
      case "Released:": {
        metadata.release_year = child.querySelector("a")?.innerText as string;
        continue;
      }
      case "Status:": {
        metadata.ongoing = child.innerText.includes("Ongoing");
        continue;
      }
      case "Description:": {
        metadata.description = child.querySelector(".top-5.Content")?.innerText as string;
        continue;
      }
      default:
        continue;
    }
  }

  return metadata;
}

export interface Chapter {
  pretype: number;
  main: number;
  sub: number;
  raw: string;
}

export async function getChapters(mangaIndexName: string) {
  const html_document = await getMangaPage(mangaIndexName);
  return extractChapters(html_document);
}

export function extractChapters(html_document: string) {
  const raw_chapters: Array<{ Chapter: string }> = JSON.parse(html_document.match(/vm\.Chapters = (.+);/m)?.[1] || "[]");

  const parsed: Chapter[] = [];

  for (const chapter of raw_chapters) {
    const match = chapter.Chapter.match(/(\d)(\d{4})(\d)/);
    if (match == null) continue;

    parsed.push({
      pretype: parseInt(match[1]),
      main: parseInt(match[2]),
      sub: parseInt(match[3]),
      raw: chapter.Chapter,
    });
  }

  return parsed;
}

export interface FullMangaMetadata {
  basic: BasicMangaMetadata;
  chapters: Chapter[];
}

export async function getFullMetadata(mangaIndexName: string) {
  const html_document = await getMangaPage(mangaIndexName);
  const basic = extractMetadata(html_document);
  const chapters = extractChapters(html_document);

  if (basic == undefined) return null;

  const full_metadata: FullMangaMetadata = {
    basic,
    chapters,
  };

  return full_metadata;
}

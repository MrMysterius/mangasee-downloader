import Fuse from "https://deno.land/x/fuse@v6.4.1/dist/fuse.esm.js?source";

const AVAILABLE_URL = "https://mangasee123.com/_search.php";
const OPTIONS = {
  isCaseSensitive: false,
  includeScore: true,
  shouldSort: true,
  keys: ["i", "s", "a"],
};

interface MangaTitles {
  i: string; // INDEX
  s: string; // NORMALIZED
  a: string[]; // ALTERNATIVES
}

interface SearchItem {
  item: MangaTitles;
  refIndex: number;
  score: number;
}

export async function searchAnime(search_term: string): Promise<SearchItem[]> {
  const res = await fetch(AVAILABLE_URL);
  const data: Array<MangaTitles> = JSON.parse(await res.text());

  const fuse = new Fuse(data, OPTIONS);
  const findings: SearchItem[] = fuse.search(search_term, { limit: 5 });

  return findings;
}

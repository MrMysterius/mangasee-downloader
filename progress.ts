import { join } from "https://deno.land/std@0.174.0/path/mod.ts";
import { Chapter } from "./metadata.ts";

interface Progress {
  current: Chapter;
  start: Chapter;
  end: Chapter;
}

export function saveProgress(target_folder: string, progress: Progress): boolean {
  const FILE_PATH = join(target_folder, "dl-progress");
  const Encoder = new TextEncoder();

  try {
    Deno.writeFileSync(FILE_PATH, Encoder.encode(JSON.stringify(progress)), { create: true, append: false });
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

export function loadProgress(target_folder: string) {
  const FILE_PATH = join(target_folder, "dl-progress");
  const Decoder = new TextDecoder();

  try {
    const progress: Progress = JSON.parse(Decoder.decode(Deno.readFileSync(FILE_PATH)));
    return progress;
  } catch (_e) {
    return undefined;
  }
}

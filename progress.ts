import { join } from "https://deno.land/std@0.174.0/path/mod.ts";

interface Progress {
  current: number;
  start: number;
  end: number;
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

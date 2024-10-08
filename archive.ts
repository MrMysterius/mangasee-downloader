import { normalize, posix } from "https://deno.land/std@0.174.0/path/mod.ts";

export async function archive(src_folder: string, archive_name: string, delete_src = true): Promise<boolean> {
  try {
    Deno.removeSync(archive_name, { recursive: true });
  } catch (_e) {}
  const cmd: string[] = ["7z", "a", archive_name, posix.normalize(`${posix.normalize(normalize(`${src_folder}`))}\\*`)];

  const process = Deno.run({
    cmd,
    stdout: "piped",
    stderr: "piped",
  });

  if (!(await process.status()).success) return false;
  if (delete_src) Deno.removeSync(src_folder, { recursive: true });
  return true;
}

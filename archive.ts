export async function archive(src_folder: string, archive_name: string): Promise<Boolean> {
  const cmd: string[] = ["7z", "a", archive_name];

  for (const file of Deno.readDirSync(src_folder)) {
    if (file.isSymlink) continue;
    cmd.push(`${src_folder}/${file.name}`);
  }

  const process = Deno.run({
    cmd,
    stdout: "piped",
    stderr: "piped",
  });

  return (await process.status()).success;
}

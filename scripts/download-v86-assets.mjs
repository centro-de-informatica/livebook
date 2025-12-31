#!/usr/bin/env node

import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "public", "v86");

const ASSETS = [
  { url: "https://github.com/copy/v86/raw/master/bios/seabios.bin", dest: "bios/seabios.bin" },
  { url: "https://github.com/copy/v86/raw/master/bios/vgabios.bin", dest: "bios/vgabios.bin" },
  { url: "https://i.copy.sh/buildroot-bzimage68.bin", dest: "images/buildroot-bzimage68.bin" },
  { url: "https://i.copy.sh/linux4.iso", dest: "images/linux4.iso", },
  { url: "https://dl-cdn.alpinelinux.org/alpine/v3.19/releases/x86/alpine-virt-3.19.9-x86.iso", dest: "images/alpine-virt-3.19.9-x86.iso" }
];

async function downloadFile({ url, dest }) {
  const fullPath = join(PUBLIC_DIR, dest);

  try {
    await access(fullPath);
    console.log(`[ok] ${dest}`);
    return;
  } catch { }

  console.log(`[..] ${dest}`);
  await mkdir(dirname(fullPath), { recursive: true });

  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`${response.status}`);

  await writeFile(fullPath, Buffer.from(await response.arrayBuffer()));
}

async function main() {
  await mkdir(PUBLIC_DIR, { recursive: true });
  for (const asset of ASSETS) await downloadFile(asset);
  console.log("[ok] done");
}

await main().catch((e) => { console.error(e.message); process.exit(1); });

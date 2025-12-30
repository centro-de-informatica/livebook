#!/usr/bin/env node

import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "public", "v86");

const ASSETS = [
  // v86 core
  {
    url: "https://copy.sh/v86/build/libv86.js",
    dest: "libv86.js",
  },
  {
    url: "https://copy.sh/v86/build/v86.wasm",
    dest: "v86.wasm",
  },
  // BIOS
  {
    url: "https://github.com/copy/v86/raw/master/bios/seabios.bin",
    dest: "bios/seabios.bin",
  },
  {
    url: "https://github.com/copy/v86/raw/master/bios/vgabios.bin",
    dest: "bios/vgabios.bin",
  },
  // Linux images
  {
    url: "https://dl-cdn.alpinelinux.org/alpine/v3.19/releases/x86/alpine-virt-3.19.9-x86.iso",
    dest: "images/alpine-virt-3.19.9-x86.iso",
  },
  {
    url: "https://i.copy.sh/buildroot-bzimage68.bin",
    dest: "images/buildroot-bzimage68.bin",
  },
  {
    url: "https://i.copy.sh/linux4.iso",
    dest: "images/linux4.iso",
  },
];

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function downloadFile(url, destPath) {
  const fullPath = join(PUBLIC_DIR, destPath);
  
  if (await fileExists(fullPath)) {
    console.log(`✓ ${destPath} (already exists)`);
    return;
  }

  console.log(`↓ Downloading ${destPath}...`);
  
  const dir = dirname(fullPath);
  await mkdir(dir, { recursive: true });

  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "v86-asset-downloader",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(fullPath, buffer);
  
  const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
  console.log(`✓ ${destPath} (${sizeMB} MB)`);
}

async function main() {
  console.log("\n📦 Downloading v86 assets...\n");
  
  await mkdir(PUBLIC_DIR, { recursive: true });

  for (const asset of ASSETS) {
    try {
      await downloadFile(asset.url, asset.dest);
    } catch (error) {
      console.error(`✗ Failed to download ${asset.dest}: ${error.message}`);
      process.exit(1);
    }
  }

  console.log("\n✅ All v86 assets downloaded successfully!\n");
}

main();

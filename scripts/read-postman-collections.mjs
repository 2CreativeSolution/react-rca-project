#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const POSTMAN_API_BASE = "https://api.getpostman.com";
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_FILE_PATH = join(SCRIPT_DIR, "..", "postman", "collections.snapshot.json");

function parseArgs(argv) {
  const result = {
    uid: "",
    details: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--uid" && argv[i + 1]) {
      result.uid = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === "--details") {
      result.details = true;
    }
  }

  return result;
}

function getHeaders() {
  const apiKey = (process.env.POSTMAN_API_KEY ?? "").trim();
  if (!apiKey) {
    throw new Error("Missing POSTMAN_API_KEY environment variable.");
  }

  return {
    "X-Api-Key": apiKey,
    "Content-Type": "application/json",
  };
}

async function requestJson(pathname) {
  const response = await fetch(`${POSTMAN_API_BASE}${pathname}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Postman API error ${response.status}: ${body}`);
  }

  return response.json();
}

function collectRequests(items, parentFolders = [], acc = []) {
  for (const item of items ?? []) {
    if (Array.isArray(item.item) && item.item.length > 0) {
      const folderName = typeof item.name === "string" && item.name.trim().length > 0
        ? item.name.trim()
        : "(unnamed folder)";
      collectRequests(item.item, [...parentFolders, folderName], acc);
      continue;
    }

    if (item.request) {
      acc.push({
        name: item.name ?? "(unnamed)",
        method: item.request.method ?? "UNKNOWN",
        url: item.request?.url?.raw ?? "(no raw url)",
        folderPath: parentFolders,
      });
    }
  }
  return acc;
}

function formatRequest(item) {
  const method = item.method ?? "UNKNOWN";
  const name = item.name ?? "(unnamed)";
  const url = typeof item.url === "string" && item.url.length > 0 ? item.url : "(no raw url)";
  const folderPrefix = Array.isArray(item.folderPath) && item.folderPath.length > 0
    ? `[${item.folderPath.join(" / ")}] `
    : "";
  return `${method.padEnd(7, " ")} ${folderPrefix}${name} -> ${url}`;
}

async function buildSnapshot() {
  const data = await requestJson("/collections");
  const collections = data.collections ?? [];

  const detailedCollections = [];

  for (const collection of collections) {
    const details = await requestJson(`/collections/${collection.uid}`);
    const fullCollection = details.collection;
    if (!fullCollection) {
      continue;
    }

    const requests = collectRequests(fullCollection.item);
    detailedCollections.push({
      uid: fullCollection.info?.uid ?? collection.uid,
      name: fullCollection.info?.name ?? collection.name ?? "(unnamed)",
      requestCount: requests.length,
      requests,
    });
  }

  detailedCollections.sort((a, b) => a.name.localeCompare(b.name));
  return {
    generatedAt: new Date().toISOString(),
    collectionCount: detailedCollections.length,
    collections: detailedCollections,
  };
}

async function writeSnapshot(snapshot) {
  const dirPath = dirname(SNAPSHOT_FILE_PATH);
  await mkdir(dirPath, { recursive: true });
  await writeFile(SNAPSHOT_FILE_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
}

function printCollectionList(snapshot) {
  if (snapshot.collectionCount === 0) {
    console.log("No Postman collections found.");
    return;
  }

  console.log(`Found ${snapshot.collectionCount} collection(s):`);
  for (const collection of snapshot.collections) {
    console.log(`- ${collection.name} (${collection.uid})`);
  }
}

function printCollectionDetails(snapshot, uid, includeDetails) {
  const collection = snapshot.collections.find((entry) => entry.uid === uid);
  if (!collection) {
    throw new Error(`Collection payload missing for uid: ${uid}`);
  }

  console.log(`Collection: ${collection.name}`);
  console.log(`UID: ${collection.uid}`);

  if (!includeDetails) {
    console.log("Use --details to print request entries.");
    return;
  }

  if (collection.requests.length === 0) {
    console.log("No requests found in this collection.");
    return;
  }

  console.log(`Requests (${collection.requests.length}):`);
  for (const request of collection.requests) {
    console.log(`- ${formatRequest(request)}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const snapshot = await buildSnapshot();
  await writeSnapshot(snapshot);
  console.log(`Snapshot updated: ${SNAPSHOT_FILE_PATH}`);

  if (!args.uid) {
    printCollectionList(snapshot);
    console.log("\nTo inspect one collection:");
    console.log("npm run postman:collections -- --uid <collection_uid> --details");
    return;
  }

  printCollectionDetails(snapshot, args.uid, args.details);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

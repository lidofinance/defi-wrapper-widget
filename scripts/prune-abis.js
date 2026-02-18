const fs = require('fs');
const { execSync } = require('child_process');
const { globSync } = require('glob');
const path = require('path');

const ARGS = process.argv.slice(2);
const FILE_GLOB = ARGS[0] || 'src/abis/**/*.ts';
const CHECK_COMMAND = 'npx tsc --noEmit';

function pruneFiles() {
  const files = globSync(FILE_GLOB);
  if (files.length === 0) {
    console.error(`❌ No files found matching: ${FILE_GLOB}`);
    process.exit(1);
  }

  console.log(`🚀 Processing ${files.length} files...`);

  for (const filePath of files) {
    processFile(filePath);
  }
}

function processFile(filePath) {
  console.log(`\n📄 File: ${filePath}`);
  let fileContent = fs.readFileSync(filePath, 'utf8');

  // Regex to find: export const Name = [ ... ] as const
  const regex = /(export const (\w+) = )(\[[\s\S]*?\])( as const)/g;

  // 1. Find all matches first to avoid the infinite loop
  const matches = [];
  let match;
  while ((match = regex.exec(fileContent)) !== null) {
    matches.push({
      fullMatch: match[0],
      prefix: match[1],
      abiName: match[2],
      arrayString: match[3],
      suffix: match[4],
    });
  }

  if (matches.length === 0) return;

  // 2. Process each ABI found in the file
  for (const item of matches) {
    console.log(`  🔍 Pruning ABI: ${item.abiName}`);

    let abiEntries;
    try {
      // Clean up string for eval (remove trailing commas if any)
      const cleanArray = item.arrayString.replace(/,(\s*\])/g, '$1');
      abiEntries = eval(`(${cleanArray})`);
    } catch (e) {
      console.error(`  ⚠️  Failed to parse ${item.abiName}. Skipping.`);
      continue;
    }

    let originalCount = abiEntries.length;
    let removedCount = 0;

    for (let i = abiEntries.length - 1; i >= 0; i--) {
      const entry = abiEntries[i];

      if (entry.type === 'error') continue;

      const tempEntries = [...abiEntries];
      tempEntries.splice(i, 1);

      // Re-generate the string for the specific block
      const newArrayString = JSON.stringify(tempEntries, null, 2);
      const newFullBlock = `${item.prefix}${newArrayString}${item.suffix}`;

      // Update the file content by replacing the OLD full match with the NEW one
      const updatedFileContent = fileContent.replace(
        item.fullMatch,
        newFullBlock,
      );
      fs.writeFileSync(filePath, updatedFileContent);

      try {
        execSync(CHECK_COMMAND, { stdio: 'ignore' });
        // Success: entry was unused. Update our "source of truth"
        abiEntries = tempEntries;
        fileContent = updatedFileContent;
        // Update the item reference so subsequent replacements find the new string
        item.fullMatch = newFullBlock;
        removedCount++;
        process.stdout.write(`✅ `);
      } catch (e) {
        // Failure: revert file
        fs.writeFileSync(filePath, fileContent);
        process.stdout.write(`❌ `);
      }
    }
    console.log(`\n  ✨ Removed ${removedCount}/${originalCount} entries.`);
  }
}

pruneFiles();

#!/usr/bin/env node

/**
 * Script to automatically bump version before deployment
 * Usage: npm run bump-version [major|minor|patch]
 */

const fs = require('fs');
const path = require('path');

const packagePath = path.join(__dirname, '..', 'package.json');
const package = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const versionType = process.argv[2] || 'patch';
const currentVersion = package.version;
const versionParts = currentVersion.split('.').map(Number);

switch (versionType) {
  case 'major':
    versionParts[0]++;
    versionParts[1] = 0;
    versionParts[2] = 0;
    break;
  case 'minor':
    versionParts[1]++;
    versionParts[2] = 0;
    break;
  case 'patch':
  default:
    versionParts[2]++;
    break;
}

const newVersion = versionParts.join('.');
package.version = newVersion;

fs.writeFileSync(packagePath, JSON.stringify(package, null, 2) + '\n');

console.log(`✅ Version bumped from ${currentVersion} to ${newVersion}`);
console.log(`📦 Remember to build and deploy after this change!`);
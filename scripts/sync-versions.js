#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the root package.json to get the new version
const rootPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const newVersion = rootPackage.version;

console.log(`Syncing workspace packages to version ${newVersion}...`);

// List of workspace packages
const workspacePackages = [
  'packages/div-flo-models',
  'packages/div-flo-core',
  'packages/div-flo-api'
];

// Update each package
workspacePackages.forEach(packagePath => {
  const packageJsonPath = path.join(packagePath, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.version = newVersion;
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`✓ Updated ${packagePath} to version ${newVersion}`);
  } else {
    console.log(`⚠ Package not found: ${packageJsonPath}`);
  }
});

console.log('Version sync complete!');
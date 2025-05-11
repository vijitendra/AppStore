// cache-buster.js
// Run this script before deploying to production to bust the cache

import fs from 'fs';
import path from 'path';

// Add timestamp to main.tsx in index.html
const indexPath = path.join('client', 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');
const timestamp = Date.now();

// Replace BUILD_TIMESTAMP with the current timestamp
indexContent = indexContent.replace('BUILD_TIMESTAMP', timestamp);

// Write the updated content back to the file
fs.writeFileSync(indexPath, indexContent);

console.log(`Cache busting complete! Timestamp: ${timestamp}`);
console.log('Now you can deploy your application to production.');
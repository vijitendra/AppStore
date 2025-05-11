// ensure-production-updates.js
// Run this script before deploying to production to ensure all updates are reflected

import fs from 'fs';
import path from 'path';

// Function to add timestamp to a file
function addTimestampToFile(filePath, timestamp = Date.now()) {
  console.log(`Adding timestamp ${timestamp} to ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Replace existing timestamp or add a new one
  const updatedContent = content.includes('BUILD_TIMESTAMP') 
    ? content.replace('BUILD_TIMESTAMP', timestamp)
    : content.replace(/\?v=\d+/g, `?v=${timestamp}`);
  
  fs.writeFileSync(filePath, updatedContent);
}

// Add timestamp to index.html
const indexPath = path.join('client', 'index.html');
addTimestampToFile(indexPath);

// Touch the CSS file to update its modified time
const indexCssPath = path.join('client', 'src', 'index.css');
if (fs.existsSync(indexCssPath)) {
  const cssContent = fs.readFileSync(indexCssPath, 'utf8');
  // Add or update a comment at the end of the file with the current timestamp
  const updatedCssContent = cssContent.replace(/\/\* Last updated: \d+ \*\//g, '');
  fs.writeFileSync(indexCssPath, updatedCssContent + `\n/* Last updated: ${Date.now()} */`);
  console.log(`Updated timestamp in ${indexCssPath}`);
}

// Touch the featured-apps-section.tsx file to update its modified time
const featuredAppsSectionPath = path.join('client', 'src', 'components', 'home', 'featured-apps-section.tsx');
if (fs.existsSync(featuredAppsSectionPath)) {
  const content = fs.readFileSync(featuredAppsSectionPath, 'utf8');
  fs.writeFileSync(featuredAppsSectionPath, content);
  console.log(`Touched ${featuredAppsSectionPath} to update modified time`);
}

console.log('Production update preparation complete!');
console.log('Now you can deploy your application to production.');
console.log('Remember to run this script each time before deploying to ensure changes are reflected.');
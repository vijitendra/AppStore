// run-cache-buster.js
// Wrapper script to run the cache-buster.js using Node.js
// This allows us to run it even without modifying package.json

const { execSync } = require('child_process');

try {
  console.log('Running cache buster script...');
  execSync('node --experimental-modules cache-buster.js', { stdio: 'inherit' });
  console.log('Cache busting completed successfully!');
} catch (error) {
  console.error('Error running cache buster:', error.message);
  process.exit(1);
}
const path = require('path');
const envPath = path.join(__dirname, '.env');
console.log('Path:', envPath);
const result = require('dotenv').config({ path: envPath });
console.log('Error:', result.error);
console.log('Parsed Keys:', result.parsed ? Object.keys(result.parsed) : 'none');
console.log('GITHUB_TOKEN present in process.env:', !!process.env.GITHUB_TOKEN);
console.log('GITHUB_TOKEN value starts with:', process.env.GITHUB_TOKEN ? process.env.GITHUB_TOKEN.substring(0, 10) : 'N/A');

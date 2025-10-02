const http = require('http');
const url = 'http://localhost:4000/api/pv-essai?page=1&limit=3';
http.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data);
    process.exit(0);
  });
}).on('error', err => { console.error('Fetch error', err.message); process.exit(2); });

const fs = require('fs');
const fetch = require('node-fetch');

(async () => {
  const payload = JSON.parse(fs.readFileSync('c:/Users/Planification/Desktop/laboapp/tmp_test_payload.json','utf8'));
  try {
    const res = await fetch('http://localhost:4000/api/pv-essai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log('BODY', text);
  } catch (e) {
    console.error('POST ERROR', e);
  }
})();

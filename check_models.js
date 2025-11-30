const https = require('https');

const apiKey = 'AIzaSyAK_HVpX5eDKa2P11L3cflc_8OT9JlVY0o';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.error) {
        console.error('Error:', json.error.message);
      } else {
        const names = json.models
          .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
          .map(m => m.name)
          .sort();
        console.log(names.join('\n'));
      }
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});

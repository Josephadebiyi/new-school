const http = require('http');

http.get('http://localhost:5173/school/login', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log("Response exists: " + (data.length > 0));
  });
}).on('error', err => console.error(err));

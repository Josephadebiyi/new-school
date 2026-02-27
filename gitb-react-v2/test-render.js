import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import * as path from 'path';

const html = fs.readFileSync(path.resolve('./index.html'), 'utf8');
const dom = new JSDOM(html, { 
  url: "http://localhost:5173/school/login",
  runScripts: "dangerously",
  resources: "usable"
});

dom.window.console.error = (msg) => console.log('REACT_ERROR:', msg);
dom.window.console.log = (msg) => console.log('REACT_LOG:', msg);

setTimeout(() => {
  console.log("WAITING...");
  process.exit(0);
}, 5000);

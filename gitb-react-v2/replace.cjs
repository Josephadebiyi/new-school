const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath));
        } else {
            if (filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
                results.push(filePath);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes("'/school/images/") || content.includes('"/school/images/') || content.includes('(/school/images/')) {
        content = content.replace(/'\/school\/images\//g, "'/images/");
        content = content.replace(/"\/school\/images\//g, '"/images/');
        content = content.replace(/\(\/school\/images\//g, '(/images/');
        fs.writeFileSync(file, content, 'utf8');
        console.log('Reverted:', file);
    }
});

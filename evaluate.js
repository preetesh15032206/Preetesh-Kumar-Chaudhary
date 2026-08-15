const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const path = require('path');

function checkFile(file) {
    try {
        const html = fs.readFileSync(file, 'utf8');
        const dom = new JSDOM(html);
        const selector = 'div:nth-of-type(3) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(3) > div:nth-of-type(2) > span:nth-of-type(1)';
        const el = dom.window.document.querySelector(selector);
        if (el) {
            console.log(`Found in ${file}:`);
            console.log(el.outerHTML);
        }
    } catch (e) {
    }
}

function traverse(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.html')) {
            checkFile(fullPath);
        }
    });
}
traverse('ML BACKEND DASHBOARD/templates');

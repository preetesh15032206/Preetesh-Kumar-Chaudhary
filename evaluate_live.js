const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const html = fs.readFileSync('app_dom.html', 'utf8');
const dom = new JSDOM(html);
const selector = 'div:nth-of-type(3) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(3) > div:nth-of-type(2) > span:nth-of-type(1)';
const el = dom.window.document.querySelector(selector);
if (el) {
    console.log("Found element:");
    console.log(el.outerHTML);
    // Also print parents up to 4 levels
    let cur = el;
    for(let i=0; i<4; i++) {
        if(cur.parentElement) {
            cur = cur.parentElement;
            console.log("Parent " + i + ": " + cur.tagName + " " + cur.className + " " + cur.id);
        }
    }
} else {
    console.log("Not found in running DOM.");
}

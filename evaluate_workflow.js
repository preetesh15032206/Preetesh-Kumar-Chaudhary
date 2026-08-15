const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const html = fs.readFileSync('ML BACKEND DASHBOARD/templates/workflow.html', 'utf8');
const dom = new JSDOM(html);
const scriptMatch = html.match(/<script>(.*?)<\/script>/s);
if (scriptMatch) {
    fs.writeFileSync('workflow_script.js', scriptMatch[1]);
    console.log("Extracted script");
}

const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const base = fs.readFileSync('ML BACKEND DASHBOARD/templates/base.html', 'utf8');
const pressure = fs.readFileSync('ML BACKEND DASHBOARD/templates/pressure.html', 'utf8');
// Mock the Jinja extends
let html = base.replace('{% block content %}{% endblock %}', pressure.replace('{% extends "base.html" %}{% block content %}', '').replace('{% endblock %}', ''));

const dom = new JSDOM(html);
const selector = 'div:nth-of-type(3) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(3) > div:nth-of-type(2) > span:nth-of-type(1)';
const el = dom.window.document.querySelector(selector);
if (el) {
    console.log("Found in composed pressure.html!");
    console.log(el.outerHTML);
}

const index = fs.readFileSync('ML BACKEND DASHBOARD/templates/index.html', 'utf8');
let html2 = base.replace('{% block content %}{% endblock %}', index.replace('{% extends "base.html" %}{% block content %}', '').replace('{% endblock %}', ''));
const dom2 = new JSDOM(html2);
const el2 = dom2.window.document.querySelector(selector);
if (el2) {
    console.log("Found in composed index.html!");
    console.log(el2.outerHTML);
}

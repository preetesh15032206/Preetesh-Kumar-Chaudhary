from bs4 import BeautifulSoup
import sys

def find_element(html_file, selector):
    with open(html_file, 'r') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    element = soup.select_one(selector)
    if element:
        print(f"Found in {html_file}:")
        print(element.prettify()[:500])
    else:
        print(f"Not found in {html_file}")

selector = 'div:nth-of-type(3) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(3) > div:nth-of-type(2) > span:nth-of-type(1)'
files = ['ML BACKEND DASHBOARD/templates/index.html', 'ML BACKEND DASHBOARD/templates/pressure.html', 'ML BACKEND DASHBOARD/templates/workflow.html']
for file in files:
    try:
        find_element(file, selector)
    except Exception as e:
        print(f"Error in {file}: {e}")


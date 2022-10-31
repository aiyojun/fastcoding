import time
import asyncio
from pyppeteer import launch
from requests_html import HTMLSession


async def main():
    browser = await launch({'headless': False, 'args': ['--disable-infobars', '--window-size=1920,1080', '--no-sandbox']})
    page = await browser.newPage()
    # time.sleep(2)
    # await page.setViewport({'width': 1920, 'height': 1080})
    # time.sleep(2)
    print("goto baidu!")
    await page.goto('https://www.baidu.com/')
    content = await page.content()
    print(content)
    # time.sleep(100)
    # page.


asyncio.get_event_loop().run_until_complete(main())
exit(0)

# create an HTML Session object
session = HTMLSession()

# Use the object above to connect to needed webpage
resp = session.get("https://bd.ipdatacloud.com/")

# Run JavaScript code on webpage
resp.html.render()

print(resp.html.html)

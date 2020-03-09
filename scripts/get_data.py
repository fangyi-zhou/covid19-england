import json
from requests_html import HTMLSession

URL = "https://www.gov.uk/government/publications/coronavirus-covid-19-number-of-cases-in-england/coronavirus-covid-19-number-of-cases-in-england"
OUT_FILE = "public/data_source.json"

session = HTMLSession()
r = session.get(URL)
last_update = r.html.search("These data are as of {}.")[0]
table_xpath = '//*[@id="contents"]/div[2]/div/div/div/table/tbody/tr'
table = r.html.xpath(table_xpath)
cases = {}
for tr in table:
    area, num = tr.xpath("//td")
    cases[area.text] = num.text

with open(OUT_FILE, "w") as f:
    json.dump({"cases": cases, "last_update": last_update}, f)

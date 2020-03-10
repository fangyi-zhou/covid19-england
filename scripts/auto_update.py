import asyncio
import os
import get_data
from time import gmtime, strftime


async def main():
    while True:
        with open(get_data.OUT_FILE) as f:
            old = f.read()
        get_data.main()
        print(
            "Fetched for updates, time:", strftime("%d %b %Y %H:%M:%S +0000", gmtime())
        )
        with open(get_data.OUT_FILE) as f:
            new = f.read()
        if new != old:
            print("Pushing new data")
            os.system("git pull")
            os.system(f"git add {get_data.OUT_FILE}")
            os.system('git commit -m "Update COVID-19 Data"')
            os.system("git push")
        await asyncio.sleep(30 * 60)  # 30 min


loop = asyncio.get_event_loop()
loop.run_until_complete(main())

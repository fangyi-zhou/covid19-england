import asyncio
import os
import get_data


async def main():
    while True:
        with open(get_data.OUT_FILE) as f:
            old = f.read()
        get_data.main()
        with open(get_data.OUT_FILE) as f:
            new = f.read()
        if new != old:
            os.system(f"git add {get_data.OUT_FILE}")
            os.system('git commit -m "Update COVID-19 Data"')
            os.system("git push")
        await asyncio.sleep(30 * 60)  # 30 min


loop = asyncio.get_event_loop()
loop.run_until_complete(main())

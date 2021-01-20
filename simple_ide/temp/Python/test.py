import asyncio
import time 

garbage = "empty"

lock = asyncio.Lock()

async def checkGarbage():
    await garbage != "empty"
    print("Garbage needs to be taken out!")

def fillGarbage():
    time.sleep(4)
    garbage = "full";
    print("filled garbage");

asyncio.get_event_loop().run_until_complete(checkGarbage())
fillGarbage()
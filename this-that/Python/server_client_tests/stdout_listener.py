import sys
import asyncio

async def listen_to_stdout():
    print(sys.stdout.readline(1000))

asyncio.run(listen_to_stdout())
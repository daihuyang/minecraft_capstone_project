import asyncio
import websockets
import sys
import io

async def hello(websocket, path):
    try:
        async for message in websocket:
            output = io.StringIO()
            exec(message)
            print(output.getvalue())
            output.close()

    except:
        raise

start_server = websockets.serve(hello, "localhost", 3001)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()

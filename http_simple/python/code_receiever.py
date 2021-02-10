import asyncio
import websockets
import sys
import io

async def receive_code(websocket, path):
    try:
        async for message in websocket:
            output = io.StringIO() #outputs the code
            exec(message)
            print(output.getvalue())
            output.close()

    except:
        raise

start_server = websockets.serve(receive_code, "localhost", 3001)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()

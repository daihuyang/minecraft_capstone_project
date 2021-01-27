import asyncio
import websockets

async def hello(websocket, path):
    command = await websocket.recv()
    exec(command)



start_server = websockets.serve(hello, "localhost", 3001)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()

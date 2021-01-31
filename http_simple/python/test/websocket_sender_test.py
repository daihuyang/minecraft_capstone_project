import asyncio
import websockets

async def test_output():
    uri = "ws://localhost:3005/"
    async with websockets.connect(uri) as websocket:
        message = "hello world!"
        await websocket.send(message)
        print(f"sent {message}")

asyncio.get_event_loop().run_until_complete(test_output())

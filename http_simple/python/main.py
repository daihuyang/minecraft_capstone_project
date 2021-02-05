# For receiving code from communicator.js
import asyncio
import websockets
import io
# HTTP Server
from multiprocessing import Process
import serve

async def receive_code(websocket, path):
    try:
        async for message in websocket:
            output = io.StringIO() #outputs the code
            exec(message)
            print(output.getvalue())
            output.close()

    except:
        raise


if __name__ == "__main__":
    # Starts Child Process for HTTP Server on port 3000, which Minecraft is listening to
    print("starting http server")
    p = Process(target=serve.run_server, args=(3000,))
    p.start()
    
    print("starting kernel")
    # Listens to receive code from webpage
    start_server = websockets.serve(receive_code, "localhost", 3001)
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
# For receiving code from communicator.js
import asyncio
import websockets
import io
# HTTP Server
from multiprocessing import Process
import serve

async def subscribe_callback(websocket, event_name: str, callback,) -> str:
    '''
    Sends JSON message over Websocket

    Whenever a message is received from Minecraft,
    there must be a response sent back.
    '''
    if not isinstance(event_name, str):
        raise TypeError("expected 'str' for event_name")

    evt_id = uuid.uuid4().hex

    message = {
        "header": {
            "messagePurpose": "subscribe",
            "messageType": "commandRequest",
            "requestId": evt_id,
            "version": 1,
        },
        "body": {"eventName": event_name, "version": 1},
    }

    await websocket.send(json.dumps(message))
    _SUBSCRIPTIONS.setdefault(event_name, []).append((evt_id, callback))
    return evt_id

async def execute_command(websocket, command: str, *args):
    '''
    Sends JSON to execute a command in the game
    '''
    if not isinstance(command, str):
        raise TypeError("expected 'str' for command")

    if args:
        command += " " + " ".join(str(a) for a in args if a is not None)

    req_id = uuid.uuid4().hex
    message = {
        "header": {
            "messagePurpose": "commandRequest",
            "messageType": "commandRequest",
            "requestId": req_id,
            "version": 1,
        },
        "body": {"commandLine": command, "version": 1},
    }

    await websocket.send(json.dumps(message))

async def get_event_list(websocket, path):
    '''
    Retrieves a list of Minecraft events to subscribe to
    from the webpage's pillbox
    '''
    try:
        async for message in websocket:
            # message assumed to be a comma separated list of events
            global event_list
            event_list = message.split(",")
            # subscribe to each event
            for event in event_list:
                await subscribe_callback(minecraft_socket, event, handle_all)
    except:
        raise


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
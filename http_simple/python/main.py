# For receiving code from communicator.js
import asyncio
import websockets
import io
# HTTP Server
from multiprocessing import Process
import serve

global minecraft_socket

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

def handle_message(message):
    '''
    Handles JSON objects received over minecraft connection

    This will be what gets stored in the database we are using
    '''
    data = json.load(message)
    return data

# Communicates with Minecraft WebSockets
async def minecraft_connection(websocket, path):
    '''
    NOTE: Requires Player to use "/connect localhost:<port>" to connect

    Creates the websocket connection with Minecraft.
    Stores events that occur in a CSV file
    '''
    print("Connected to Minecraft")
    minecraft_socket = websocket # initializes the global variable
    try:
        async for message in websocket:
            data = handle_message(message)
            
            #TODO: Store Data
            print(data)

            await subscribe(websocket, )
    except:
        raise
            

# Communicates with JavaScript Pillbox
async def subscribe_to_event_list(websocket, path):
    '''
    Retrieves a comma separated list of events from the pillbox.
    Subscribes to each event in the comma separated list
    '''
    try:
        async for message in websocket:
            # message assumed to be a comma separated list of events
            event_list = message.split(",")
            # subscribes to each event in the list
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
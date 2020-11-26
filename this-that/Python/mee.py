import asyncio
import json
import uuid
import typing
import websockets
# this is for passing initialization arguments (from JS)
import sys
import random

minecraft_response = "none"
trigger_event = "none"
dummy_socket = ""

# Dictionary to keep track of subscriptions that occur.
_SUBSCRIPTIONS: typing.Dict[str, typing.List[typing.Any]] = {}

event_selected = "nothing"
mine_socket = None

async def subscribe_callback(websocket, event_name: str, callback,) -> str:
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

def handle_block_placed(response):
    # Properties we care about.
    if (response['eventName'] == "BlockPlaced"):
        print(f'Block: {response["properties"]["Block"]}')
        print(f'Placement: {response["properties"]["PlacementMethod"]}')
        print(f'Item: {response["properties"]["ToolItemType"]}')
        # print(f'Test: {response["properties"]}')

def handle_all(response):
    pass

def on_response(response_str):
    response = json.loads(response_str)
    header = response["header"]
    body = response["body"]

    if header.get("messagePurpose") == "event":
        event_name = body.get("eventName")
        subs = list(_SUBSCRIPTIONS.get(event_name) or [])
        for evt_id, sub in subs:
            sub(body)

async def listen_for_selection(websocket, path):
    try:
        async for message in websocket:
            event_selected = message
            open("test.txt", "a").writable(message)
            await subscribe_callback(mine_socket, "BlockPlaced", handle_block_placed)
    except:
        raise

async def startup(websocket, path):
    print("Connection success!")
    mine_socket = websocket
    # await subscribe_callback(websocket, event_selected, handle_block_placed)
    
    try:
        # Handle any message recieved.
        
        async for message in websocket:
            on_response(message)
            data = json.loads(message)

            # we should only try executing a command if the event was triggered by the player
            if "eventName" in data["body"]:
                # case that desired event is triggered
                if data["body"]["eventName"] == trigger_event or ("camera" in message and trigger_event == "CameraUsed"):
                    command = ""
                    if minecraft_response == "Teleport":
                        x = random.randint(1,5)
                        y = random.randint(1,5)
                        command = f"tp ~+{x} ~+{y} ~+2"
                    elif minecraft_response == "Explode":
                        command = "summon tnt"
                    elif minecraft_response == "ChangeWeather":
                        command = "toggledownfall"
                    elif minecraft_response == "Tom":
                        command = "setblock ~ ~+5 ~ anvil"
                    elif minecraft_response == "SpawnChicken":
                        command = "summon chicken"
                    elif minecraft_response == "Trampoline":
                        command = "setblock ~ ~-1 ~ slime"
                    elif minecraft_response == "ChangeTime":
                        command = "time add 8000"

                    await execute_command(websocket, command)

            with open("events.json", "a") as json_file:
                json.dump(data, json_file) # data / message something might be weird
    except:
        raise


print("/connect localhost:8765")
start_server = websockets.serve(
    startup,
    "localhost",
    8765,
    subprotocols=["com.microsoft.minecraft.wsencrypt"],
    ping_interval=None)

async def listen_to_js(websocket, path):
    try:
        async for message in websocket:
            global minecraft_response
            global trigger_event
            trigger_event = message.split(",")[0]
            minecraft_response = message.split(",")[1]
            # subscribing to event now
            await subscribe_callback(dummy_socket, trigger_event, handle_all)
    except:
        raise

start_js_server = websockets.serve(listen_to_js, "localhost", 8766)

asyncio.get_event_loop().run_until_complete(start_js_server)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
import asyncio
import json
import uuid
import typing
import websockets


# Dictionary to keep track of subscriptions that occur.
_SUBSCRIPTIONS: typing.Dict[str, typing.List[typing.Any]] = {}

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

def on_response(response_str):
    response = json.loads(response_str)
    header = response["header"]
    body = response["body"]

    if header.get("messagePurpose") == "event":
        event_name = body.get("eventName")
        subs = list(_SUBSCRIPTIONS.get(event_name) or [])
        for evt_id, sub in subs:
            sub(body)

async def startup(websocket, path):
    print("Connection Established!")

    # When a block is placed we get called.
    # Things we care about
    await subscribe_callback(websocket, "BlockPlaced", handle_block_placed)
    await subscribe_callback(websocket, "ItemSmelted", on_response)
    try:
        # Handle any message recieved.
        async for message in websocket:
            on_response(message)
            data = json.loads(message)
    except:
        raise


print("Starting MEE PySever. Use `/connect localhost:8765` to connect to the server. Please make sure you disable encryption.")
start_server = websockets.serve(
    startup,
    "localhost",
    8765,
    subprotocols=["com.microsoft.minecraft.wsencrypt"],
    ping_interval=None)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
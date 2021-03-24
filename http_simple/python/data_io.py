'''
Reading and Writing Event Data
'''
import jsonlines
import json

def write_event(filename, event):
    '''
    Appends JSON event to event file

    Params
    ------
    file : file-like object
        File or string that is a path to data
    event : str
        JSON object that will be appended
    '''
    with jsonlines.open(filename, mode='a') as writer:
        event = clean_event(event)
        writer.write(event)
    
def read_events(file):
    # Using Pandas function to read JSONLines
    '''
    Yields events from file given

    Params
    ------
    file : file-like object
        JSON LINES file with game events stored in them
    '''
    with jsonlines.open(file, mode='r') as reader:
        for event in reader:
            event = clean_event(event)
            yield event

def clean_event(event):
    '''
    TODO Remove unwanted fields from JSON before storing

    Params:
    -------
    event : str / JSON object
        Event data received over websockets

    Returns
    -------
    event : str / JSON
        The event given with set of unnecessary fields removed
    '''
    if 'body' not in event:
        raise KeyError("'body' not within JSON object")
    if 'properties' not in event['body']:
        raise KeyError("'properties' not within 'body'")

    # Attributes that we want from event['body']['properties']
    attributes = { 
        'Block',
        'Difficulty',
        'FeetPosX',
        'FeetPosY',
        'FeetPosZ',
        'Health',
        'Light',
        'NearbyAnimals',
        'NearbyMonsters',
        'NearbyOthers',
        'NearbyPlayers',
        'NearbyVillagers',
        'PlayerBiome',
        'PlayerGameMode',
        'PlayerLevel',
        'PlayerSpeed',
        'TimeOfDay',
        'ToolItemType',
        'UserId'
    }

    data_dict = {
        'eventName': event['body']['eventName']
    }

    data_dict.update({key: event['body']['properties'][key] for key in attributes if key in event['body']['properties']})
    json_string = json.dumps(data_dict)

    return json_string

if __name__ == '__main__':
    s = '{"body": {"eventName": "BlockPlaced", "measurements": {"Count": 1, "RecordCnt": 1, "SeqMax": 160, "SeqMin": 160}, "properties": {"AccountType": 1, "ActiveSessionID": "9f3beaf8-d151-42bd-9ac3-045bdaf2a470", "AppSessionID": "debe470c-87df-464c-b6f1-b0f37a64a7b8", "AuxType": 0, "Biome": 1, "Block": "grass", "Branch": "jeffmck/ubco/edu_r14", "Build": "1.14.50", "BuildNum": "5052702", "BuildPlat": 8, "BuildTypeID": 1, "Cheevos": false, "ClientId": "81212c94f22545bd9e19f3ecf3b80683", "Commit": "d8a96978687022cda6792c77259f718760a4538f", "CurrentInput": 1, "CurrentNumDevices": 1, "DeviceSessionId": "debe470c-87df-464c-b6f1-b0f37a64a7b8", "Difficulty": "PEACEFUL", "Dim": 0, "FeetPosX": -15, "FeetPosY": 4, "FeetPosZ": -37, "GlobalMultiplayerCorrelationId": "5bd14333-2160-4692-8633-da447f668f60", "Health": 20, "Light": 15, "Mode": 1, "Namespace": "minecraft", "NearbyAnimals": 5, "NearbyMonsters": 0, "NearbyOther": 2, "NearbyPlayers": 1, "NearbyVillagers": 0, "NetworkType": 0, "PlacementMethod": 0, "Plat": "10.0.19042", "PlayerBiome": "plains", "PlayerGameMode": 1, "PlayerLevel": 0, "PlayerSpeed": 3.814697265625e-05, "Role": 0, "RotX": 47.58697509765625, "RotY": 96.8795166015625, "SchemaCommitHash": "19b6ec0744c3c83a00ecbd840f48cb080c7bc64d", "TimeOfDay": 4509, "ToolItemType": 2, "Treatments": "", "Type": 2, "UserId": "d55edb4e-a2f5-4d0d-99f5-b9f3c5d2a812", "WorldFeature": 0, "WorldSessionId": "e4c51940-46ba-45f3-a9d9-af9eb54be7a3", "editionType": "pocket", "isTrial": 0, "locale": "en_US", "vrMode": false}}, "header": {"messagePurpose": "event", "requestId": "00000000-0000-0000-0000-000000000000", "version": 1}}'
    print(clean_event(
        json.loads(s)
    ))
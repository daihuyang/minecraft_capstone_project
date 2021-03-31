'''
Reading and Writing Event Data
'''
import os.path 
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
    if os.path.isfile(filename): mode='a'
    else: mode='w'
    with jsonlines.open(filename, mode=mode) as writer:
        event = clean_event(event)
        writer.write(event)
    
def read_events(filename):
    # Using Pandas function to read JSONLines
    '''
    Yields events from file given

    Params
    ------
    file : file-like object
        JSON LINES file with game events stored in them
    '''
    with jsonlines.open(filename, mode='r') as reader:
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
    event : dict
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
    return data_dict

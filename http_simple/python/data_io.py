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
    
    return event['body']
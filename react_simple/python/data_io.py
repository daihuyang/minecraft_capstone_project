'''
Reading and Writing Event Data
'''
import jsonlines

def write_event(file, event):
    '''
    Appends JSON event to event file

    Params
    ------
    file : file-like object
        File or string that is a path to data
    event : str
        JSON object that will be appended
    '''
    with jsonlines.open(file, mode='a') as writer:
        writer.writer(event)
    

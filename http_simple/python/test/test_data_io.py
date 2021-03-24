import sys
sys.path.append("..")

import unittest
from data_io import (
    write_event,
    read_events,
    clean_event
)

class TestStorage(unittest.TestCase):
    def setUp(self):
        return super().setUp()

    def tearDown(self):
        return super().tearDown()

    def test_write_event(self):
        pass

    def test_read_events(self):
        pass

    def test_clean_event(self):
        print(clean_event(json.load('{"body": {"eventName": "BlockPlaced", "measurements": {"Count": 1, "RecordCnt": 1, "SeqMax": 160, "SeqMin": 160}, "properties": {"AccountType": 1, "ActiveSessionID": "9f3beaf8-d151-42bd-9ac3-045bdaf2a470", "AppSessionID": "debe470c-87df-464c-b6f1-b0f37a64a7b8", "AuxType": 0, "Biome": 1, "Block": "grass", "Branch": "jeffmck/ubco/edu_r14", "Build": "1.14.50", "BuildNum": "5052702", "BuildPlat": 8, "BuildTypeID": 1, "Cheevos": false, "ClientId": "81212c94f22545bd9e19f3ecf3b80683", "Commit": "d8a96978687022cda6792c77259f718760a4538f", "CurrentInput": 1, "CurrentNumDevices": 1, "DeviceSessionId": "debe470c-87df-464c-b6f1-b0f37a64a7b8", "Difficulty": "PEACEFUL", "Dim": 0, "FeetPosX": -15, "FeetPosY": 4, "FeetPosZ": -37, "GlobalMultiplayerCorrelationId": "5bd14333-2160-4692-8633-da447f668f60", "Health": 20, "Light": 15, "Mode": 1, "Namespace": "minecraft", "NearbyAnimals": 5, "NearbyMonsters": 0, "NearbyOther": 2, "NearbyPlayers": 1, "NearbyVillagers": 0, "NetworkType": 0, "PlacementMethod": 0, "Plat": "10.0.19042", "PlayerBiome": "plains", "PlayerGameMode": 1, "PlayerLevel": 0, "PlayerSpeed": 3.814697265625e-05, "Role": 0, "RotX": 47.58697509765625, "RotY": 96.8795166015625, "SchemaCommitHash": "19b6ec0744c3c83a00ecbd840f48cb080c7bc64d", "TimeOfDay": 4509, "ToolItemType": 2, "Treatments": "", "Type": 2, "UserId": "d55edb4e-a2f5-4d0d-99f5-b9f3c5d2a812", "WorldFeature": 0, "WorldSessionId": "e4c51940-46ba-45f3-a9d9-af9eb54be7a3", "editionType": "pocket", "isTrial": 0, "locale": "en_US", "vrMode": false}}, "header": {"messagePurpose": "event", "requestId": "00000000-0000-0000-0000-000000000000", "version": 1}}')))
        


if __name__ == '__main__':
    unittest.main()
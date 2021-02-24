#!/bin/bash

echo "Starting Peer Testing Two"
echo "finding http_simple/python/main.py"

main_file_path=$(find . -type f -name main.py | head -1)

cd $(dirname $main_file_path)
python main.py

echo "Closing Http Server"
echo "Ending Peer Testing Two"


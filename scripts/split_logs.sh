#!/bin/bash

SERVICES=`docker-compose config --services`

for x in ${SERVICES}; do
    echo "SAVE LOGS FOR ${x} to ./logs/${x}.txt"
    grep ${x} ./logs/log.txt | ansi2txt > ./logs/${x}.txt
done;

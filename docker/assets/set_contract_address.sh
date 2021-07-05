#!/bin/bash

CONTRACT_ADDRESS=$(cat /root/vor-ui/build/contracts/XYDistribution.json | jq --raw-output '.networks["696969"].address')
sed -i "s/REACT_APP_XYDistribution_ADDRESS=/REACT_APP_XYDistribution_ADDRESS=${CONTRACT_ADDRESS}/g" "/root/vor-ui/.env"

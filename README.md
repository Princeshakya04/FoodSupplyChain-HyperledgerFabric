
## First start the basic network

This will generate 2 orgs with 2 peers....

```
  - ./network.sh down
  - export COMPOSE_PROJECT_NAME=net
  - IMAGE_TAG=latest
  - export PATH=${PWD}/../bin:${PWD}:$PATH
  - export FABRIC_CFG_PATH=${PWD}/configtx
  - ./network.sh up -s couchdb -ca
  - ./network.sh createChannel -c supplychainchannel
  - ./network.sh deployCC -c supplychainchannel -ccn iac_chaincode -ccl go -ccp ../chaincode -cci Init
```

## Installing chaincode on new peer1 org1 

  - export CORE_PEER_TLS_ENABLED=true

  - export CC_NAME=iac_chaincode

  - export CORE_PEER_LOCALMSPID="Org1MSP"

  - export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.fsc.com/peers/peer1.org1.fsc.com/tls/ca.crt

  - export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.fsc.com/users/Admin@org1.fsc.com/msp

  - CORE_PEER_ADDRESS=localhost:8051 peer channel join -b ./channel-artifacts/supplychainchannel.block

  - export CORE_PEER_ADDRESS=localhost:8051

  - peer lifecycle chaincode install ${CC_NAME}.tar.gz

  - peer lifecycle chaincode queryinstalled

  - CORE_PEER_ADDRESS=localhost:8051 peer chaincode invoke -n iac_chaincode -C supplychainchannel -o localhost:7050 --ordererTLSHostnameOverride orderer.fsc.com  --tls --cafile ${PWD}/organizations/ordererOrganizations/fsc.com/orderers/orderer.fsc.com/msp/tlscacerts/tlsca.fsc.com-cert.pem --peerAddresses localhost:8051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.fsc.com/peers/peer1.org1.fsc.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.fsc.com/peers/peer0.org2.fsc.com/tls/ca.crt  -c '{"Args":["createUser","admin","admin@admin.com","admin","Noida India", "adminpw"]}'

  - CORE_PEER_ADDRESS=localhost:8051 peer chaincode invoke -n iac_chaincode -C supplychainchannel -o localhost:7050 --ordererTLSHostnameOverride orderer.fsc.com  --tls --cafile ${PWD}/organizations/ordererOrganizations/fsc.com/orderers/orderer.fsc.com/msp/tlscacerts/tlsca.fsc.com-cert.pem --peerAddresses localhost:8051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.fsc.com/peers/peer1.org1.fsc.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.fsc.com/peers/peer0.org2.fsc.com/tls/ca.crt  -c '{"Args":["createUser","admin","admin@admin.com","manufacturer","Noida India", "Secure@123"]}'


## Installing chaincode on new peer1 org2
  - export CORE_PEER_TLS_ENABLED=true

  - export CORE_PEER_LOCALMSPID="Org2MSP"

  - export CC_NAME=iac_chaincode 

  - export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.fsc.com/peers/peer1.org2.fsc.com/tls/ca.crt

  - export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.fsc.com/users/Admin@org2.fsc.com/msp

  - CORE_PEER_ADDRESS=localhost:5051 peer channel join -b ./channel-artifacts/supplychainchannel.block

  - export CORE_PEER_ADDRESS=localhost:5051

  - peer lifecycle chaincode install ${CC_NAME}.tar.gz

  - peer lifecycle chaincode queryinstalled

  - CORE_PEER_ADDRESS=localhost:5051 peer chaincode invoke -n iac_chaincode -C supplychainchannel -o localhost:7050 --ordererTLSHostnameOverride orderer.fsc.com  --tls --cafile ${PWD}/organizations/ordererOrganizations/fsc.com/orderers/orderer.fsc.com/msp/tlscacerts/tlsca.fsc.com-cert.pem --peerAddresses localhost:5051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.fsc.com/peers/peer1.org2.fsc.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.fsc.com/peers/peer0.org2.fsc.com/tls/ca.crt  -c '{"Args":["createUser","admin","admin@admin.com","consumer","Noida, India", "adminpw"]}'

## Add Org3
```
  - cd addOrg3
  - ./addOrg3.sh up -c supplychainchannel -s couchdb -ca

  - cd ..
  Install Chaincode

  - export CC_NAME=iac_chaincode 
  - source ./scripts/setOrgPeerContext.sh 3
  - peer lifecycle chaincode install ${CC_NAME}.tar.gz
  - peer lifecycle chaincode queryinstalled
  - export CC_PACKAGE_ID=packageId from above 

  - peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.fsc.com --tls --cafile "${PWD}/organizations/ordererOrganizations/fsc.com/orderers/orderer.fsc.com/msp/tlscacerts/tlsca.fsc.com-cert.pem" --channelID supplychainchannel --name iac_chaincode --version 1.0 --init-required --package-id $CC_PACKAGE_ID --sequence 1
  
  - peer lifecycle chaincode querycommitted --channelID supplychainchannel --name iac_chaincode --cafile "${PWD}/organizations/ordererOrganizations/fsc.com/orderers/orderer.fsc.com/msp/tlscacerts/tlsca.fsc.com-cert.pem"

  - peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.fsc.com --tls --cafile "${PWD}/organizations/ordererOrganizations/fsc.com/orderers/orderer.fsc.com/msp/tlscacerts/tlsca.fsc.com-cert.pem" -C supplychainchannel -n iac_chaincode --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.fsc.com/peers/peer0.org2.fsc.com/tls/ca.crt" --peerAddresses localhost:11051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org3.fsc.com/peers/peer0.org3.fsc.com/tls/ca.crt" -c '{"Args":["createUser","admin","admin@admin.com","distributor","Noida, India", "adminpw"]}'

```

## Add peer1 org3
```
  - create file docker-compose-peer1-org3.yaml in fsc-network/docker/
  - create file registerPeer1Org3.sh in fsc-network/organizations/fabric-ca
  - execute ./organizations/fabric-ca/registerPeer1Org3.sh
  - execute docker-compose -f docker/docker-compose-peer1-org3.yaml up -d
  - Check if peer 1 on 4051 have joined any channel - CORE_PEER_ADDRESS=localhost:4051 peer channel list
  - join peer1 to channel by CORE_PEER_ADDRESS=localhost:4051 peer channel join -b ./channel-artifacts/supplychainchannel.block
```

## Deploy chaincode on peer1 org3
  - export CORE_PEER_TLS_ENABLED=true

  - export CORE_PEER_LOCALMSPID="Org3MSP"

  - export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org3.fsc.com/peers/peer1.org3.fsc.com/tls/ca.crt

  - export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org3.fsc.com/users/Admin@org3.fsc.com/msp

  - export CORE_PEER_ADDRESS=localhost:4051

  - peer lifecycle chaincode install ${CC_NAME}.tar.gz

  - peer lifecycle chaincode queryinstalled

  - CORE_PEER_ADDRESS=localhost:4051 peer chaincode invoke -n iac_chaincode -C supplychainchannel -o localhost:7050 --ordererTLSHostnameOverride orderer.fsc.com  --tls --cafile ${PWD}/organizations/ordererOrganizations/fsc.com/orderers/orderer.fsc.com/msp/tlscacerts/tlsca.fsc.com-cert.pem --peerAddresses localhost:4051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org3.fsc.com/peers/peer1.org3.fsc.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.fsc.com/peers/peer0.org2.fsc.com/tls/ca.crt  -c '{"Args":["createUser","admin","admin@admin.com","retailer","Noida, India", "adminpw"]}'

## Setup for web-app servers and client 
  - Open a new terminal
  - cd web-app/servers
  - npm install 
  - node app.js
  - open a new terminal 
  - cd web-app/client
  - npm install 
  - npm start

## If doing setup for the first time then 
  - Update Certificates of web-app/servers/fabric/connection-org1.json from organization/peerOrganizations/org1.fsc.com/connection-org1.json, copy the certificates of "pem" parameter only.  
  - Update Certificates of web-app/servers/fabric/connection-org2.json from organization/peerOrganizations/org2.fsc.com/connection-org2.json, copy the certificates of "pem" parameter only. 
  - Update Certificates of web-app/servers/fabric/connection-org3.json from organization/peerOrganizations/org3.fsc.com/connection-org3.json, copy the certificates of "pem" parameter only.
  
## Supply chain flow
  1. Login with admin user..
  2. Create a Manufacturer user by login to admin.
  3. Login with the created manufacturer user.
  4. Create a product.. 
  5. Login with admin again, and create a wholesaler user.
  6. Login with manufacturer and hit the transact api to send the product from manufacturer to wholesaler.
  7. Login with wholesaler user..
  8. Hit the transact API to send the product to distributor
  9. Create a retailer user in middlemen org 
  10. Login with distributor and use transact api to send it to retailer
  11. Login with admin and create a consumer. 
  12. Login with consumer to create a product order.
  13. Login with retailer to sell the product to consumer.
  14. Login with retailer to mark the product as delivered.


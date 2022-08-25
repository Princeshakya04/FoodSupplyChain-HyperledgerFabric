#!/bin/bash

export PATH=$PATH:${PWD}/../bin
export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/org2.fsc.com/
fabric-ca-client register --caname ca-org2 --id.name peer1 --id.secret peer1pw --id.type peer --tls.certfiles ${PWD}/organizations/fabric-ca/org2/tls-cert.pem
mkdir -p organizations/peerOrganizations/org2.fsc.com/peers/peer1.org2.fsc.com
fabric-ca-client enroll -u https://peer1:peer1pw@localhost:8054 --caname ca-org2 -M ${PWD}/organizations/peerOrganizations/org2.fsc.com/peers/peer1.org2.fsc.com/msp --csr.hosts peer1.org2.fsc.com --tls.certfiles ${PWD}/organizations/fabric-ca/org2/tls-cert.pem
cp ${PWD}/organizations/peerOrganizations/org2.fsc.com/msp/config.yaml ${PWD}/organizations/peerOrganizations/org2.fsc.com/peers/peer1.org2.fsc.com/msp/config.yaml
fabric-ca-client enroll -u https://peer1:peer1pw@localhost:8054 --caname ca-org2 -M ${PWD}/organizations/peerOrganizations/org2.fsc.com/peers/peer1.org2.fsc.com/tls --enrollment.profile tls --csr.hosts peer1.org2.fsc.com --csr.hosts localhost --tls.certfiles ${PWD}/organizations/fabric-ca/org2/tls-cert.pem
cp ${PWD}/organizations/peerOrganizations/org2.fsc.com/peers/peer1.org2.fsc.com/tls/tlscacerts/* ${PWD}/organizations/peerOrganizations/org2.fsc.com/peers/peer1.org2.fsc.com/tls/ca.crt
cp ${PWD}/organizations/peerOrganizations/org2.fsc.com/peers/peer1.org2.fsc.com/tls/signcerts/* ${PWD}/organizations/peerOrganizations/org2.fsc.com/peers/peer1.org2.fsc.com/tls/server.crt
cp ${PWD}/organizations/peerOrganizations/org2.fsc.com/peers/peer1.org2.fsc.com/tls/keystore/* ${PWD}/organizations/peerOrganizations/org2.fsc.com/peers/peer1.org2.fsc.com/tls/server.key
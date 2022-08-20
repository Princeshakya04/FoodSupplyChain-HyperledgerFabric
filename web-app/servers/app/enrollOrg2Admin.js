/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const {
    buildCAClient,
    enrollAdmin
} = require('../utils/CAUtil.js');
const {
    buildCCORG2,
    buildWallet
} = require('../utils/AppUtil.js');

const mspOrg2 = 'Org2MSP';
const walletPath = path.join(process.cwd(), process.env.MIDDLEMEN_WALLET);

async function enrollOrg2Admin() {
    let response;
    try {
        // build an in memory object with the network configuration (also known as a connection profile)
        const ccp = buildCCORG2();

        // build an instance of the fabric ca services client based on
        // the information in the network configuration
        const caClient = buildCAClient(
            FabricCAServices, 
            ccp, 
            'ca.org2.fsc.com'
        );

        // setup the wallet to hold the credentials of the application user
        const wallet = await buildWallet(Wallets, walletPath);

        // in a real application this would be done on an administrative flow, and only once
        await enrollAdmin(caClient, wallet, mspOrg2);

        response = {
            success: true,
            message: `Enrolled org1caadmin successfully`
        };

    } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
        response = {
            success: false,
            message: `${error}`
        };
    }
    return response;
}

module.exports = enrollOrg2Admin;
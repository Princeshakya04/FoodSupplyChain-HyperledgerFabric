const fs = require('fs');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const { Wallets, Gateway, X509Identity } = require('fabric-network');

const manufacturerCcpPath = path.join(process.cwd(), process.env.MANUFACTURER_CONN);
const manufacturerCcpFile = fs.readFileSync(manufacturerCcpPath, 'utf8');
const manufacturerCcp = JSON.parse(manufacturerCcpFile);

const middlemenCcpPath = path.join(process.cwd(), process.env.MIDDLEMEN_CONN);
const middlemenCcpFile = fs.readFileSync(middlemenCcpPath, 'utf8');
const middlemenCcp = JSON.parse(middlemenCcpFile);

const consumerCcpPath = path.join(process.cwd(), process.env.CONSUMER_CONN);
const consumerCcpFile = fs.readFileSync(consumerCcpPath, 'utf8');
const consumerCcp = JSON.parse(consumerCcpFile);

const {
    buildCAClient
} = require('../utils/CAUtil.js');
const {
    buildCCORG1,
    buildCCORG2,
    buildCCORG3
} = require('../utils/AppUtil.js');


function getConnectionMaterial(isManufacturer, isMiddleMen, isConsumer) {
    const connectionMaterial = {};

    if (isManufacturer) {
        connectionMaterial.walletPath = path.join(process.cwd(), process.env.MANUFACTURER_WALLET);
        connectionMaterial.connection = manufacturerCcp;
        connectionMaterial.orgMSPID = process.env.MANUFACTURER_MSP;
        connectionMaterial.caURL = process.env.MANUFACTURER_CA_ADDR;
        connectionMaterial.caHost = process.env.MANUFACTURER_CA_HOST;
    } 

    if (isMiddleMen) {
        connectionMaterial.walletPath = path.join(process.cwd(), process.env.MIDDLEMEN_WALLET);
        connectionMaterial.connection = middlemenCcp;
        connectionMaterial.orgMSPID = process.env.MIDDLEMEN_MSP;
        connectionMaterial.caURL = process.env.MIDDLEMEN_CA_ADDR;
        connectionMaterial.caHost = process.env.MIDDLEMEN_CA_HOST;
    }
    
    if (isConsumer) {
        // console.log(process.env.CONSUMER_WALLET);
        connectionMaterial.walletPath = path.join(process.cwd(), process.env.CONSUMER_WALLET);
        connectionMaterial.connection = consumerCcp;
        connectionMaterial.orgMSPID = process.env.CONSUMER_MSP;
        connectionMaterial.caURL = process.env.CONSUMER_CA_ADDR;
        connectionMaterial.caHost = process.env.CONSUMER_CA_HOST;
    }

    return connectionMaterial;
}

exports.connect = async (isManufacturer, isMiddleMen, isConsumer, userID) => {
    const gateway = new Gateway();

    try {
        const { walletPath, connection } = getConnectionMaterial(
            isManufacturer,
            isMiddleMen,
            isConsumer
        );

        let wallet = await Wallets.newFileSystemWallet(walletPath);
        const userExists = await wallet.get(userID);
        if (!userExists) {
            console.error(`An identity for the user ${userID} does not exist in the wallet. Register ${userID} first`);
            return { status: 401, error: 'User identity does not exist in the wallet.' };
        }

        await gateway.connect(connection, {
            wallet,
            identity: userID,
            discovery: { enabled: true, asLocalhost: Boolean(process.env.AS_LOCALHOST) },
        });
        const network = await gateway.getNetwork(process.env.CHANNEL);
        const contract = await network.getContract(process.env.CONTRACT);
        console.log('Connected to fabric network successly.');

        const networkObj = { gateway, network, contract };

        return networkObj;
    } catch (err) {
        console.error(`Fail to connect network: ${err}`);
        await gateway.disconnect();
        return { status: 500, error: err.toString() };
    }
};

exports.query = async (networkObj, ...funcAndArgs) => {
    try {
        console.log(`Query parameter: ${funcAndArgs}`);
        const funcAndArgsStrings = funcAndArgs.map(elem => String(elem));
        const response = await networkObj.contract.evaluateTransaction(...funcAndArgsStrings);
        console.log(`Transaction ${funcAndArgs} has been evaluated: ${response}`);

        return JSON.parse(response);
    } catch (err) {
        console.error(`Failed to evaluate transaction: ${err}`);
        return { status: 500, error: err.toString() };
    } finally {
        if (networkObj.gatway) {
            await networkObj.gateway.disconnect();
        }
    }
};

exports.invoke = async (networkObj, ...funcAndArgs) => {
    try {
        let chaincodeName = "iac_chaincode"
        console.log("========");
        console.log(networkObj.contract)
        console.log(`Invoke parameter: ${funcAndArgs}`);
        const funcAndArgsStrings = funcAndArgs.map(elem => String(elem));
        console.log(funcAndArgsStrings);
        const response = await networkObj.contract.submitTransaction(...funcAndArgsStrings);
        console.log(response);
        console.log(`Transaction ${funcAndArgs} has been submitted: ${response}`);

        return JSON.parse(response);
    } catch (err) {
        console.error(`Failed to submit transaction: ${err}`);
        return { status: 500, error: err.toString() };
    } finally {
        if (networkObj.gatway) {
            await networkObj.gateway.disconnect();
        }
    }
};

exports.enrollAdmin = async (isManufacturer, isMiddleMen, isConsumer) => {
    try {
        const { walletPath, orgMSPID, caURL } = getConnectionMaterial(isManufacturer, isMiddleMen, isConsumer);

        const wallet = new FileSystemWallet(walletPath);
        const adminExists = await wallet.exists(process.env.ADMIN);
        if (adminExists) {
            console.error('Admin user identity already exists in the wallet');
            return;
        }

        const ca = new FabricCAServices(caURL);
        const enrollment = await ca.enroll({
            enrollmentID: process.env.ADMIN,
            enrollmentSecret: process.env.ADMIN_SECRET,
        });

        
        const identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: orgMSPID,
            type: 'X.509',
        };


        await wallet.put(process.env.ADMIN, identity);
        console.log(`Successfully enrolled admin user and imported it into the wallet`);
        return identity;
    } catch (err) {
        console.error(`Failed to enroll admin user: ${err}`);
        process.exit(1);
    }
};

exports.registerUser = async (isManufacturer, isMiddleMen, isConsumer, userID) => {
    const gateway = new Gateway();

    try {
        console.log(userID);
        const { walletPath, connection, orgMSPID, caURL, caHost } = getConnectionMaterial(
            isManufacturer,
            isMiddleMen,
            isConsumer
        );

        console.log(walletPath);
        console.log(orgMSPID);

        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const userExists = await wallet.get(userID);
        if (userExists) {
            console.error(`An identity for the user ${userID} already exists in the wallet`);
            return { status: 400, error: 'User identity already exists in the wallet.' };
        }

        await gateway.connect(connection, {
            wallet,
            identity: process.env.ADMIN,
            discovery: { 
                enabled: true, 
                asLocalhost: Boolean(process.env.AS_LOCALHOST)
            },
        });

        console.log(isManufacturer, isMiddleMen, isConsumer);

        // build an in memory object with the network configuration (also known as a connection profile)
        var ccp;
        if (isManufacturer) {
            console.log("inside manufactrurre")
            ccp = await buildCCORG1();
            console.log(ccp);
        }
        
        if (isMiddleMen) {
            console.log("inside middlemen")
            ccp = await buildCCORG2();
            console.log(ccp);
        }
        
        if (isConsumer) {
            console.log("inside consumer")
            ccp = await buildCCORG3();
            console.log(ccp);
        }

        
        console.log("asdfasfdasfdasdfasdf");
        console.log(ccp);

        // build an instance of the fabric ca services client based on
        // the information in the network configuration
        const caClient = buildCAClient(
            FabricCAServices, 
            ccp, 
            caHost
        );

        // Must use an admin to register a new user
        const adminUser = await wallet.get('admin');
        
        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminUser.type);
        const adminIdentity = await provider.getUserContext(adminUser, 'admin');

        const secret = await caClient.register({
            affiliation: 'org1', 
            enrollmentID: userID, 
            role: 'client' 
        }, adminIdentity);

        const enrollment = await caClient.enroll({ 
            enrollmentID: userID, 
            enrollmentSecret: secret 
        });


        const identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: orgMSPID,
            type: 'X.509',
        };


        await wallet.put(userID, identity);

        console.log(`Successfully registered user. Use userID ${userID} to login`);
        return identity;
    } catch (err) {
        console.log(err);
        console.error(`Failed to register user ${userID}: ${err}`);
        return { status: 500, error: err.toString() };
    } finally {
        await gateway.disconnect();
    }
};

exports.checkUserExists = async (isManufacturer,isMiddleMen,isConsumer, userID) => {
    try {
        const { walletPath } = getConnectionMaterial(isManufacturer,isMiddleMen,isConsumer);
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const userExists = await wallet.get(userID);
        return userExists;
    } catch (err) {
        console.error(`Failed to check user exists ${userID}: ${err}`);
        return { status: 500, error: err.toString() };
    }
};

'use strict';

const org1UserId = 'admin';
const org1UserPasswd = 'adminpw';
const org2UserId = 'admin';
const org2UserPasswd = 'adminpw';
const org3UserId = 'admin';
const org3UserPasswd = 'adminpw';
let adminUserId;
let adminUserPasswd;

/**
 *
 * @param {*} FabricCAServices
 * @param {*} ccp
 */
exports.buildCAClient = (FabricCAServices, ccp, caHostName) => {
    // Create a new CA client for interacting with the CA.
    const caInfo = ccp.certificateAuthorities[caHostName]; //lookup CA details from config
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const caClient = new FabricCAServices(caInfo.url, {
        trustedRoots: caTLSCACerts,
        verify: false
    }, caInfo.caName);

    console.log(`Built a CA Client named ${caInfo.caName}`);
    return caClient;
};

exports.enrollAdmin = async (caClient, wallet, orgMspId) => {
    try {

        if (orgMspId == "Org1MSP") {
            adminUserId = org1UserId;
            adminUserPasswd = org1UserPasswd;
        } else if (orgMspId == "Org2MSP") {
            adminUserId = org2UserId;
            adminUserPasswd = org2UserPasswd;
        } else if (orgMspId == "Org3MSP") {
            adminUserId = org3UserId;
            adminUserPasswd = org3UserPasswd;
        }
        // Check to see if we've already enrolled the admin user.
        const identity = await wallet.get(adminUserId);
        if (identity) {
            console.log('An identity for the admin user already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await caClient.enroll({
            enrollmentID: adminUserId,
            enrollmentSecret: adminUserPasswd
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: orgMspId,
            type: 'X.509',
        };
        await wallet.put(adminUserId, x509Identity);
        console.log('Successfully enrolled admin user and imported it into the wallet');
    } catch (error) {
        console.error(`Failed to enroll admin user : ${error}`);
    }
};


exports.registerAndEnrollUser = async (caClient, wallet, orgMspId, userId, affiliation) => {
    try {
        if (orgMspId == "Org1MSP") {
            adminUserId = org1UserId;
            adminUserPasswd = org1UserPasswd;
        } else if (orgMspId == "Org2MSP") {
            adminUserId = org2UserId;
            adminUserPasswd = org2UserPasswd;
        } else if (orgMspId == "Org3MSP") {
            adminUserId = org3UserId;
            adminUserPasswd = org3UserPasswd;
        }
        // Check to see if we've already enrolled the user
        const userIdentity = await wallet.get(userId);
        if (userIdentity) {
            console.log(`An identity for the user ${userId} already exists in the wallet`);
            return;
        }

        // Must use an admin to register a new user
        const adminIdentity = await wallet.get(adminUserId);
        if (!adminIdentity) {
            console.log('An identity for the admin user does not exist in the wallet');
            console.log('Enroll the admin user before retrying');
            return;
        }

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, adminUserId);

        // Register the user, enroll the user, and import the new identity into the wallet.
        // if affiliation is specified by client, the affiliation value must be configured in CA
        const secret = await caClient.register({
            affiliation: affiliation,
            enrollmentID: userId,
            role: 'client'
        }, adminUser);
        const enrollment = await caClient.enroll({
            enrollmentID: userId,
            enrollmentSecret: secret
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: orgMspId,
            type: 'X.509',
        };
        await wallet.put(userId, x509Identity);
        console.log(`Successfully registered and enrolled user ${userId} and imported it into the wallet`);
    } catch (error) {
        console.error(`Failed to register user : ${error}`);
    }
};
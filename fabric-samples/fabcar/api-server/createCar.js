/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');


async function main( params ) {
    try {
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('fabcar');

        const id = params.id
        const department = params.department
        const role = params.role
        const employee_name = params.employee_name
        const clearance_status = params.clearance_status

        await contract.submitTransaction('createIdentity', `${ id }`, `${ department }`, `${ role }`, `${ employee_name }`, `${ clearance_status }`);
        console.log('Transaction has been submitted');

        await gateway.disconnect();

    } 
    catch (error) {
        console.error(`Failed to create transaction: ${error}`);
        process.exit(1);
    }
}

module.exports = { main }

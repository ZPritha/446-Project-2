/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class IdentityRegistry extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const identities = [
            { department: 'IT', role: 'System Admin', employee_name: 'Tomoko', clearance_status: 'Active' },
            { department: 'HR', role: 'Manager', employee_name: 'Brad', clearance_status: 'Active' },
            { department: 'Finance', role: 'Analyst', employee_name: 'Jin Soo', clearance_status: 'Active' },
            { department: 'IT', role: 'Developer', employee_name: 'Max', clearance_status: 'Suspended' },
            { department: 'HR', role: 'Recruiter', employee_name: 'Adriana', clearance_status: 'Active' },
            { department: 'Finance', role: 'Manager', employee_name: 'Michel', clearance_status: 'Active' },
            { department: 'IT', role: 'Developer', employee_name: 'Aarav', clearance_status: 'Revoked' },
            { department: 'HR', role: 'Manager', employee_name: 'Pari', clearance_status: 'Active' },
            { department: 'Finance', role: 'Analyst', employee_name: 'Valeria', clearance_status: 'Active' },
            { department: 'IT', role: 'System Admin', employee_name: 'Shotaro', clearance_status: 'Active' },
        ];

        for (let i = 0; i < identities.length; i++) {
            identities[i].docType = 'identity';
            await ctx.stub.putState('EMP' + String(i).padStart(3, '0'), Buffer.from(JSON.stringify(identities[i])));
            console.info('Added <--> ', identities[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryIdentity(ctx, employeeId) {
        const identityAsBytes = await ctx.stub.getState(employeeId);
        if (!identityAsBytes || identityAsBytes.length === 0) {
            throw new Error(`${employeeId} does not exist`);
        }
        console.log(identityAsBytes.toString());
        return identityAsBytes.toString();
    }

    async createIdentity(ctx, employeeId, department, role, employeeName, clearanceStatus) {
        console.info('============= START : Create Identity ===========');

        const identity = {
            docType: 'identity',
            department,
            role,
            employee_name: employeeName,
            clearance_status: clearanceStatus,
        };

        await ctx.stub.putState(employeeId, Buffer.from(JSON.stringify(identity)));
        console.info('============= END : Create Identity ===========');
    }

    async queryAllIdentities(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const { key, value } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async updateClearanceStatus(ctx, employeeId, newStatus) {
        console.info('============= START : updateClearanceStatus ===========');

        const identityAsBytes = await ctx.stub.getState(employeeId);
        if (!identityAsBytes || identityAsBytes.length === 0) {
            throw new Error(`${employeeId} does not exist`);
        }
        const identity = JSON.parse(identityAsBytes.toString());
        identity.clearance_status = newStatus;

        await ctx.stub.putState(employeeId, Buffer.from(JSON.stringify(identity)));
        console.info('============= END : updateClearanceStatus ===========');
    }

    async queryByDepartment(ctx, department) {
        const queryString = {
            selector: {
                docType: 'identity',
                department,
            },
        };
        return await this._getQueryResultForQueryString(ctx, JSON.stringify(queryString));
    }

    async queryByStatus(ctx, clearanceStatus) {
        const queryString = {
            selector: {
                docType: 'identity',
                clearance_status: clearanceStatus,
            },
        };
        return await this._getQueryResultForQueryString(ctx, JSON.stringify(queryString));
    }

    async _getQueryResultForQueryString(ctx, queryString) {
        const resultsIterator = await ctx.stub.getQueryResult(queryString);
        const allResults = [];
        for await (const { key, value } of resultsIterator) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        return JSON.stringify(allResults);
    }

}

module.exports = IdentityRegistry;

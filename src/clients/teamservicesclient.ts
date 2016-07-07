/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import basem = require("vso-node-api/ClientApiBases");
import VsoBaseInterfaces = require("vso-node-api/interfaces/common/VsoBaseInterfaces");
import Q = require("q");

// This class is not exported since we want to enforce the use of the Q-based class
class TeamServicesApi extends basem.ClientApiBase {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[]) {
        super(baseUrl, handlers, "node-vsts-vscode-api");
    }

    getVstsInfo(onResult: (err: any, statusCode: number, obj: any) => void): void {
        this.restClient.getJson(this.vsoClient.resolveUrl("/vsts/info"), "", null, null, onResult);
    }
}

export class QTeamServicesApi extends basem.QClientApiBase {
    api: TeamServicesApi;

    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[]) {
        super(baseUrl, handlers, TeamServicesApi);
    }

    public getVstsInfo(): Q.Promise<any> {
        let defer: Q.Deferred<{}> = Q.defer();

        this.api.getVstsInfo((err: any, statusCode: number, obj: any) => {
            if (err) {
                err.statusCode = statusCode;
                defer.reject(err);
            } else {
                defer.resolve(obj);
            }
        });

        return defer.promise;
    }
}

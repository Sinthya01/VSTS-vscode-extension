/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { IRequestHandler } from "vso-node-api/interfaces/common/VsoBaseInterfaces";
import { getBasicHandler } from "vso-node-api/WebApi";
import { getNtlmHandler } from "vso-node-api/WebApi";
import { Constants } from "../helpers/constants";

export class CredentialInfo {
    private _credentialHandler: IRequestHandler;

    constructor(accessToken: string);
    constructor(username: string, password?: string);
    constructor(username: string, password?: string, domain?: string, workstation?: string);

    constructor(username: string, password?: string, domain?: string, workstation?: string) {
        if (username !== undefined && password !== undefined) {
            // NTLM (we don't support Basic auth)
            this._credentialHandler = getNtlmHandler(username, password, domain, workstation);
        } else {
            // Personal Access Token (use username since it is first argument to constructor)
            this._credentialHandler = getBasicHandler(Constants.OAuth, username);
        }
    }

    public get CredentialHandler() : IRequestHandler {
        return this._credentialHandler;
    }
    public set CredentialHandler(handler : IRequestHandler)  {
        this._credentialHandler = handler;
    }
}

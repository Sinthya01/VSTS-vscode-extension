/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { IRequestHandler } from "vso-node-api/interfaces/common/VsoBaseInterfaces";
import { getBasicHandler } from "vso-node-api/WebApi";

export class CredentialInfo {
    private _credentialHandler: IRequestHandler;

    constructor(accessToken: string);
    constructor(username: string, password?: string);

    constructor(username: string, password?: string) {
        if (password !== undefined) {
            // NTLM or Basic
        } else {
            // Personal Access Token
            this._credentialHandler = getBasicHandler("OAuth", username);
        }
    }

    public get CredentialHandler() : IRequestHandler {
        return this._credentialHandler;
    }
    public set CredentialHandler(handler : IRequestHandler)  {
        this._credentialHandler = handler;
    }
}

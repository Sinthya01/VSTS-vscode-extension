/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { BasicCredentialHandler } from "vso-node-api/handlers/basiccreds";
import { getBasicHandler } from "vso-node-api/WebApi";
import { RepositoryInfo } from "../info/repositoryinfo";
import { UserInfo } from "../info/userinfo";

export class TeamServerContext {
    private _userInfo: UserInfo;
    private _repositoryInfo: RepositoryInfo;

    //The constructor simply parses the remoteUrl to determine if we're Team Services or Team Foundation Server.
    //Any additional information we can get from the url is also parsed.  Once we call the vsts/info api, we can
    //get the rest of the information that we need.
    constructor(remoteUrl: string) {
        if (remoteUrl === undefined) { return; }

        this._repositoryInfo = new RepositoryInfo(remoteUrl);
    }

    private _credentialHandler: BasicCredentialHandler;
    public SetCredentialHandler(pat: string): void {
        this._credentialHandler = getBasicHandler("OAuth", pat);
    }
    public get CredentialHandler() : BasicCredentialHandler {
        return this._credentialHandler;
    }
    public get RepoInfo(): RepositoryInfo {
        return this._repositoryInfo;
    }
    public set RepoInfo(info: RepositoryInfo) {
        this._repositoryInfo = info;
    }
    public get UserInfo(): UserInfo {
        return this._userInfo;
    }
    public set UserInfo(info: UserInfo) {
        this._userInfo = info;
    }
}

/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { BasicCredentialHandler } from "vso-node-api/handlers/basiccreds";
import { getBasicHandler } from "vso-node-api/WebApi";
import { Logger } from "../helpers/logger";

var url = require("url");

export class TeamServerContext {
    private _originalUrl: string;
    private _host: string;
    private _hostName: string;
    private _path: string;
    private _pathName: string;
    private _port: string;
    private _protocol: string;
    private _query: string;

    private _account: string;
    private _collection: string;
    private _collectionId: string;
    private _teamProject: string;
    private _repositoryName: string;

    private _isTeamServicesUrl: boolean = false;

    private _userId: string;
    private _providerDisplayName: string;
    private _customDisplayName: string;
    private _repositoryId: string;

    //The constructor simply parses the remoteUrl for the account name and determines if we are Team Services or not
    //The additional account info is set later after a call to the vsts/info api (the results of which are
    //passed to UpdateValues).  If the vsts/info api doesn't exist on the server, Fallback is used to fall
    //back to manually parsing the remoteUrl for all of the information.
    constructor(remoteUrl: string) {
        if (remoteUrl === undefined) { return; }

        this._originalUrl = remoteUrl;

        let purl = url.parse(remoteUrl);
        if (purl != null) {
            this._host = purl.host;

            // Only set the account and determine if it is Team Services or not
            let splitHost: string[] = this._host.split(".");
            if (splitHost.length > 0) {
                this._account = splitHost[0];
                if (splitHost.length > 2) {
                    this._isTeamServicesUrl = this._host.toLowerCase().indexOf(".visualstudio.com") >= 0;
                }
            }
        }
    }

    //This function is used to set the server context values after the call to the vsts/info api.
    //repositoryInfo is a JSON blob (not strongly-typed).
    //NOTE: This code does not support on-prem Tfs repository urls.
    public UpdateValues(repositoryInfo: any) {
        let purl = url.parse(repositoryInfo.serverUrl);
        if (purl != null) {
            this._host = purl.host;
            this._hostName = purl.hostName;
            this._path = purl.path;
            this._pathName = purl.pathName;
            this._port = purl.port;
            this._protocol = purl.protocol;
            this._query = purl.query;

            let splitHost = this._host.split(".");
            if (splitHost.length > 0) {
                this._account = splitHost[0];
                if (splitHost.length > 2) {
                    this._isTeamServicesUrl = this._host.toLowerCase().indexOf(".visualstudio.com") >= 0;
                    Logger.LogDebug("_isTeamServicesUrl: " + this._isTeamServicesUrl.toString());
                    //The following properties are returned from the vsts/info api
                    //If you add additional properties to the server context, they need to be set here
                    this._collection = repositoryInfo.collection.name;
                    Logger.LogDebug("_collection: " + this._collection);
                    this._collectionId = repositoryInfo.collection.id;
                    Logger.LogDebug("_collectionId: " + this._collectionId);
                    this._repositoryId = repositoryInfo.repository.id;
                    Logger.LogDebug("_repositoryId: " + this._repositoryId);
                    this._repositoryName = repositoryInfo.repository.name;
                    Logger.LogDebug("_repositoryName: " + this._repositoryName);
                    this._teamProject = repositoryInfo.repository.project.name;
                    Logger.LogDebug("_teamProject: " + this._teamProject);
                }
            }
        }
    }

    private _credentialHandler: BasicCredentialHandler;
    public SetCredentialHandler(pat: string): void {
        this._credentialHandler = getBasicHandler("OAuth", pat);
    }
    public get CredentialHandler() : BasicCredentialHandler {
        return this._credentialHandler;
    }

    public get Account(): string {
        return this._account;
    }
    public get AccountUrl(): string {
        return this._protocol + "//" + this._host;
    }
    public get CollectionId(): string {
        return this._collectionId;
    }
    public get CollectionName(): string {
        return this._collection;
    }
    public get CollectionUrl(): string {
        if (this._account !== this._collection) {
            return this.AccountUrl + "/" + this._collection;
        } else {
            return this.AccountUrl;
        }
    }
    public get Host(): string {
        return this._host;
    }
    public get RepositoryId(): string {
        return this._repositoryId;
    }
    public SetRepositoryId(repositoryId: string): void {
        this._repositoryId = repositoryId;
    }
    public get RepositoryName(): string {
        return this._repositoryName;
    }
    public get RepositoryUrl(): string {
        return this.TeamProjectUrl + "/_git/" + this._repositoryName;
    }
    public get TeamProjectUrl(): string {
        return this.CollectionUrl + "/" + this._teamProject;
    }
    public get TeamProject(): string {
        return this._teamProject;
    }
    public get UserCustomDisplayName(): string {
        return this._customDisplayName;
    }
    public SetUserCustomDisplayName(displayName: string): void {
        this._customDisplayName = displayName;
    }
    public get UserProviderDisplayName(): string {
        return this._providerDisplayName;
    }
    public SetUserProviderDisplayName(displayName: string): void {
        this._providerDisplayName = displayName;
    }
    public get UserId(): string {
        return this._userId;
    }
    public SetUserId(userId: string): void {
        this._userId = userId;
    }
    public get IsTeamServices(): boolean {
        return this._isTeamServicesUrl;
    }
}

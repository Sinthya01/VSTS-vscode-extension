/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { Utils } from "../helpers/utils";

var pgc = require("parse-git-config");
var gri = require("git-repo-info");
var path = require("path");
var url = require("url");

export class GitContext {
    private _gitConfig: any;
    private _gitRepoInfo: any;
    private _gitFolder: string;
    private _gitParentFolder: string;
    private _gitOriginalRemoteUrl: string;
    private _gitRemoteUrl: string;
    private _gitCurrentBranch: string;
    private _gitCurrentRef: string;
    private _isSsh: boolean = false;
    private _isTeamServicesUrl: boolean = false;

    constructor(rootPath: string) {
        this._isTeamServicesUrl = false;

        if (rootPath != null) {
            this._gitFolder = Utils.FindGitFolder(rootPath);

            if (this._gitFolder != null) {
                // With parse-git-config, cwd is the directory containing the path, .git/config, you want to sync
                this._gitParentFolder = path.dirname(this._gitFolder);
                this._gitConfig = pgc.sync({ cwd: this._gitParentFolder});
                /* tslint:disable:quotemark */
                this._gitOriginalRemoteUrl = this._gitConfig['remote "origin"'].url;
                /* tslint:enable:quotemark */

                this._gitRepoInfo = gri(this._gitFolder);
                this._gitCurrentBranch = this._gitRepoInfo.branch;
                this._gitCurrentRef = "refs/heads/" + this._gitCurrentBranch;

                let purl = url.parse(this._gitOriginalRemoteUrl);
                if (purl != null) {
                    let splitHostName = purl.hostname.split(".");
                    if (splitHostName.length > 2) {
                        this._isTeamServicesUrl = true; //splitHostName[1] === "visualstudio" && splitHostName[2] === "com";
                        if (this._isTeamServicesUrl === true) {
                            let splitHref = purl.href.split("@");
                            if (splitHref.length === 2) {  //RemoteUrl is SSH
                                //For Team Services, default to https:// as the protocol
                                this._gitRemoteUrl = "https://" + purl.hostname + purl.pathname;
                                this._isSsh = true;
                            } else {
                                this._gitRemoteUrl = this._gitOriginalRemoteUrl;
                            }
                        }
                    }
                }
            }
        }
    }

    public get CurrentBranch(): string {
        return this._gitCurrentBranch;
    }
    public get CurrentRef(): string {
        return this._gitCurrentRef;
    }
    public get GitFolder(): string {
        return this._gitFolder;
    }
    public get IsSsh(): boolean {
        return this._isSsh;
    }
    public get IsTeamServices(): boolean {
        return this._isTeamServicesUrl;
    }
    public get RemoteUrl(): string {
        return this._gitRemoteUrl;
    }
    public get RepositoryParentFolder(): string {
        return this._gitParentFolder;
    }
}

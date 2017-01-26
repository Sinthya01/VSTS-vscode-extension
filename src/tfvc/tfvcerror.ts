/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { ITfvcErrorData } from "./interfaces";

export class TfvcError {

    error: Error;
    message: string;
    stdout: string;
    stderr: string;
    exitCode: number;
    tfvcErrorCode: string;
    tfvcCommand: string;

    constructor(data: ITfvcErrorData) {
        if (data.error) {
            this.error = data.error;
            this.message = data.error.message;
        } else {
            this.error = void 0;
        }

        this.message = this.message || data.message || "Tfvc error";
        this.stdout = data.stdout;
        this.stderr = data.stderr;
        this.exitCode = data.exitCode;
        this.tfvcErrorCode = data.tfvcErrorCode;
        this.tfvcCommand = data.tfvcCommand;
    }

    toString(): string {
        let result = this.message + " " +
            JSON.stringify(
                {
                    exitCode: this.exitCode,
                    TfvcErrorCode: this.tfvcErrorCode,
                    gitCommand: this.tfvcCommand,
                    stdout: this.stdout,
                    stderr: this.stderr
                },
                [],
                2);

        if (this.error) {
            result += (<any>this.error).stack;
        }

        return result;
    }
}

export class TfvcErrorCodes {
    static get BadConfigFile(): string { return "BadConfigFile"; }
    static get AuthenticationFailed(): string { return "AuthenticationFailed"; }
    static get NoUserNameConfigured(): string { return "NoUserNameConfigured"; }
    static get NoUserEmailConfigured(): string { return "NoUserEmailConfigured"; }
    static get NoRemoteRepositorySpecified(): string { return "NoRemoteRepositorySpecified"; }
    static get NotAGitRepository(): string { return "NotAGitRepository"; }
    static get NotAtRepositoryRoot(): string { return "NotAtRepositoryRoot"; }
    static get Conflict(): string { return "Conflict"; }
    static get UnmergedChanges(): string { return "UnmergedChanges"; }
    static get PushRejected(): string { return "PushRejected"; }
    static get RemoteConnectionError(): string { return "RemoteConnectionError"; }
    static get DirtyWorkTree(): string { return "DirtyWorkTree"; }
    static get CantOpenResource(): string { return "CantOpenResource"; }
    static get GitNotFound(): string { return "GitNotFound"; }
    static get CantCreatePipe(): string { return "CantCreatePipe"; }
    static get CantAccessRemote(): string { return "CantAccessRemote"; }
    static get RepositoryNotFound(): string { return "RepositoryNotFound"; }
};

/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import * as cp from "child_process";
import { ITfvcCommand, IExecutionResult } from "./interfaces";
import { Tfvc } from "./tfvc";
import { IWorkspace } from "./interfaces";
import { GetVersion } from "./commands/getversion";
import { FindWorkspace } from "./commands/findworkspace";

var _ = require("underscore");

export class Repository {

    constructor(
        private _tfvc: Tfvc,
        private repositoryRootFolder: string,
        private env: any = {}
    ) { }

    get tfvc(): Tfvc {
        return this._tfvc;
    }

    get path(): string {
        return this.repositoryRootFolder;
    }

    async exec(args: string[], options: any = {}): Promise<IExecutionResult> {
        options.env = _.assign({}, options.env || {});
        options.env = _.assign(options.env, this.env);

        return await this.tfvc.exec(this.repositoryRootFolder, args, options);
    }

    stream(args: string[], options: any = {}): cp.ChildProcess {
        options.env = _.assign({}, options.env || {});
        options.env = _.assign(options.env, this.env);

        return this.tfvc.stream(this.repositoryRootFolder, args, options);
    }

    spawn(args: string[], options: any = {}): cp.ChildProcess {
        options.env = _.assign({}, options.env || {});
        options.env = _.assign(options.env, this.env);

        return this.tfvc.spawn(args, options);
    }

    async findWorkspace(localPath: string): Promise<IWorkspace> {
        return this.runCommand<IWorkspace>(
            new FindWorkspace(localPath));
    }

    async version(): Promise<string> {
        return this.runCommand<string>(
            new GetVersion());
    }

    private async runCommand<T>(cmd: ITfvcCommand<T>): Promise<T> {
        const result = await this.exec(cmd.getArguments(), cmd.getOptions());
        return cmd.parseOutput(result);
    }
}

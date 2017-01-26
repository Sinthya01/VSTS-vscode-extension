/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import * as cp from "child_process";
import { EventEmitter, Event } from "vscode";
import { IDisposable, toDisposable, dispose } from "./util";
import { IExecutionResult } from "./interfaces";
import { TfvcError, TfvcErrorCodes } from "./tfvcerror";
import { Repository } from "./repository";

var _ = require("underscore");

export class Tfvc {

    private tfvcPath: string;

    private _onOutput = new EventEmitter<string>();
    get onOutput(): Event<string> { return this._onOutput.event; }

    constructor(localPath?: string) {
        if (localPath !== undefined) {
            this.tfvcPath = localPath;
        } else {
            // TODO get it from settings
            this.tfvcPath = "D:\\tmp\\bin\\TEE-CLC-14.0.4\\tf.cmd";
        }
    }

    open(repositoryRootFolder: string, env: any = {}): Repository {
        return new Repository(this, repositoryRootFolder, env);
    }

    async exec(cwd: string, args: string[], options: any = {}): Promise<IExecutionResult> {
        // default to the cwd passed in, but allow options.cwd to overwrite it
        options = _.extend({ cwd }, options || {});
        return await this._exec(args, options);
    }

    stream(cwd: string, args: string[], options: any = {}): cp.ChildProcess {
        options = _.assign({ cwd }, options || {});
        return this.spawn(args, options);
    }

    private async _exec(args: string[], options: any = {}): Promise<IExecutionResult> {
        const child = this.spawn(args, options);

        if (options.input) {
            child.stdin.end(options.input, "utf8");
        }

        const result = await Tfvc.execProcess(child);

        if (result.exitCode) {
            let tfvcErrorCode: string = null;

            if (/Authentication failed/.test(result.stderr)) {
                tfvcErrorCode = TfvcErrorCodes.AuthenticationFailed;
            } else if (/Not a git repository/.test(result.stderr)) {
                tfvcErrorCode = TfvcErrorCodes.NotAGitRepository;
            } else if (/bad config file/.test(result.stderr)) {
                tfvcErrorCode = TfvcErrorCodes.BadConfigFile;
            } else if (/cannot make pipe for command substitution|cannot create standard input pipe/.test(result.stderr)) {
                tfvcErrorCode = TfvcErrorCodes.CantCreatePipe;
            } else if (/Repository not found/.test(result.stderr)) {
                tfvcErrorCode = TfvcErrorCodes.RepositoryNotFound;
            } else if (/unable to access/.test(result.stderr)) {
                tfvcErrorCode = TfvcErrorCodes.CantAccessRemote;
            }

            if (options.log !== false) {
                this.log(`${result.stderr}\n`);
            }

            return Promise.reject<IExecutionResult>(new TfvcError({
                message: "Failed to execute tfvc",
                stdout: result.stdout,
                stderr: result.stderr,
                exitCode: result.exitCode,
                tfvcErrorCode: tfvcErrorCode,
                tfvcCommand: args[0]
            }));
        }

        return result;
    }

    private static async execProcess(child: cp.ChildProcess): Promise<IExecutionResult> {
        const disposables: IDisposable[] = [];

        const once = (ee: NodeJS.EventEmitter, name: string, fn: Function) => {
            ee.once(name, fn);
            disposables.push(toDisposable(() => ee.removeListener(name, fn)));
        };

        const on = (ee: NodeJS.EventEmitter, name: string, fn: Function) => {
            ee.on(name, fn);
            disposables.push(toDisposable(() => ee.removeListener(name, fn)));
        };

        const [exitCode, stdout, stderr] = await Promise.all<any>([
            new Promise<number>((c, e) => {
                once(child, "error", e);
                once(child, "exit", c);
            }),
            new Promise<string>(c => {
                const buffers: string[] = [];
                on(child.stdout, "data", b => buffers.push(b));
                once(child.stdout, "close", () => c(buffers.join("")));
            }),
            new Promise<string>(c => {
                const buffers: string[] = [];
                on(child.stderr, "data", b => buffers.push(b));
                once(child.stderr, "close", () => c(buffers.join("")));
            })
        ]);

        dispose(disposables);

        return { exitCode, stdout, stderr };
    }

    spawn(args: string[], options: any = {}): cp.ChildProcess {
        if (!this.tfvcPath) {
            throw new Error("tfvc could not be found in the system.");
        }

        if (!options) {
            options = {};
        }

        if (!options.stdio && !options.input) {
            options.stdio = ["ignore", null, null]; // Unless provided, ignore stdin and leave default streams for stdout and stderr
        }

        options.env = _.assign({}, process.env, options.env || {});

        if (options.log !== false) {
            this.log(`tf ${args.join(" ")}\n`);
        }

        return cp.spawn(this.tfvcPath, args, options);
    }

    private log(output: string): void {
        this._onOutput.fire(output);
    }
}


/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import * as cp from "child_process";
import { TeamServerContext } from "../contexts/servercontext";
import { Logger } from "../helpers/logger";
import { Strings } from "../helpers/strings";
import { IDisposable, toDisposable, dispose } from "./util";
import { IArgumentProvider, IExecutionResult } from "./interfaces";
import { TfvcError, TfvcErrorCodes } from "./tfvcerror";
import { Repository } from "./repository";
import { TfvcSettings } from "./tfvcsettings";
import { TfvcVersion } from "./tfvcversion";
import { TfvcOutput } from "./tfvcoutput";
import { Telemetry } from "../services/telemetry";
import { TfvcTelemetryEvents } from "../helpers/constants";

var _ = require("underscore");
import * as fs from "fs";
import * as path from "path";

export class Tfvc implements IDisposable {
    private _tfvcPath: string;
    private _proxy: string;
    private _isExe: boolean = false;
    private _minVersion: string = "14.0.4";  //Minimum CLC version
    private _tfRunner: TfRunner;

    public constructor(localPath?: string) {
        Logger.LogDebug(`TFVC Creating Tfvc object with localPath='${localPath}'`);
        // Get Proxy from settings
        const settings = new TfvcSettings();
        this._proxy = settings.Proxy;
        Logger.LogDebug(`Using TFS proxy: ${this._proxy}`);

        if (localPath !== undefined) {
            this._tfvcPath = localPath;
        } else {
            // get the location from settings
            this._tfvcPath = settings.Location;
            Logger.LogDebug(`TFVC Retrieved from settings; localPath='${this._tfvcPath}'`);
            if (!this._tfvcPath) {
                Logger.LogWarning(`TFVC Couldn't find where the TF command lives on disk.`);
                throw new TfvcError({
                    message: Strings.TfvcLocationMissingError,
                    tfvcErrorCode: TfvcErrorCodes.TfvcLocationMissing
                });
            }
        }

        // check to make sure that the file exists in that location
        let exists: boolean = fs.existsSync(this._tfvcPath);
        if (exists) {
            // if it exists, check to ensure that it's a file and not a folder
            const stats: fs.Stats = fs.lstatSync(this._tfvcPath);
            if (!stats || !stats.isFile()) {
                Logger.LogWarning(`TFVC ${this._tfvcPath} exists but isn't a file.`);
                throw new TfvcError({
                    message: Strings.TfMissingError + this._tfvcPath,
                    tfvcErrorCode: TfvcErrorCodes.TfvcNotFound
                });
            }
            this._isExe = path.extname(this._tfvcPath) === ".exe";
            if (this._isExe) {
                this._minVersion = "14.0.0";  //Minimum tf.exe version
                Telemetry.SendEvent(TfvcTelemetryEvents.UsingExe);
            } else {
                Telemetry.SendEvent(TfvcTelemetryEvents.UsingClc);
            }
        } else {
            Logger.LogWarning(`TFVC ${this._tfvcPath} does not exist.`);
            throw new TfvcError({
                message: Strings.TfMissingError + this._tfvcPath,
                tfvcErrorCode: TfvcErrorCodes.TfvcNotFound
            });
        }

        // Setup the tf runner
        this._tfRunner = new TfRunner(this._tfvcPath, { cwd: undefined });
    }

    public dispose() {
        if (this._tfRunner) {
            this._tfRunner.dispose();
            this._tfRunner = undefined;
        }
    }

    public get isExe(): boolean { return this._isExe; }
    public get Location(): string { return this._tfvcPath; }

    /**
     * This method checks the version of the CLC against the minimum version that we expect.
     * It throws an error if the version does not meet or exceed the minimum.
     */
    public CheckVersion(version: string) {
        if (!version) {
            // If the version isn't set just return
            Logger.LogDebug(`TFVC CheckVersion called without a version.`);
            return;
        }

        // check the version of TFVC command line
        const minVersion: TfvcVersion = TfvcVersion.FromString(this._minVersion);
        const curVersion: TfvcVersion = TfvcVersion.FromString(version);
        if (TfvcVersion.Compare(curVersion, minVersion) < 0) {
            Logger.LogWarning(`TFVC ${version} is less that the min version of ${this._minVersion}.`);
            throw new TfvcError({
                message: Strings.TfVersionWarning + minVersion.ToString(),
                tfvcErrorCode: TfvcErrorCodes.TfvcMinVersionWarning
            });
        }
    }

    /**
     * Call open to get the repository object that allows you to perform TFVC commands.
     */
    public Open(serverContext: TeamServerContext, repositoryRootFolder: string, env: any = {}): Repository {
        return new Repository(serverContext, this, repositoryRootFolder, env);
    }

    public async Exec(cwd: string, args: IArgumentProvider, options: any = {}): Promise<IExecutionResult> {
        // default to the cwd passed in, but allow options.cwd to overwrite it
        options = _.extend({ cwd }, options || {});

        // TODO: do we want to handle proxies or not for the EXE? for tf.exe the user could simply setup the proxy at the command line.
        //       tf.exe remembers the proxy settings and uses them as it needs to.
        if (this._proxy && !this._isExe) {
            args.AddProxySwitch(this._proxy);
        }

        Logger.LogDebug(`TFVC: tf ${args.GetArgumentsForDisplay()}`);
        if (options.log !== false) {
            TfvcOutput.AppendLine(`tf ${args.GetArgumentsForDisplay()}`);
        }

        return await this._tfRunner.Run(args, options, this._isExe);
    }
}

class TfRunner implements IDisposable {
    private _location: string;
    private _options: any;
    private _runningInstance: cp.ChildProcess;

    public constructor(location: string, options: any) {
        this._location = location;
        this._options = options;
    }

    public dispose() {
        if (this._runningInstance) {
            this._runningInstance.kill();
            this._runningInstance = undefined;
        }
    }

    public async Run(args: IArgumentProvider, options: any, isExe: boolean): Promise<IExecutionResult> {
        const start: number = new Date().getTime();
        const tfInstance: cp.ChildProcess = await this.getMatchingTfInstance(options);
        // now that we have the matching one, start a new process (but don't wait on it to finish)
        this.startNewTfInstance(options);

        // Use the tf instance to perform the command
        const argsForStandardInput: string = args.GetCommandLine();
        const result: IExecutionResult = await this.runCommand(argsForStandardInput, tfInstance, isExe);

        // log the results
        const end: number = new Date().getTime();
        Logger.LogDebug(`TFVC: ${args.GetCommand()} exit code: ${result.exitCode} (duration: ${end - start}ms)`);

        return result;
    }

    private async getMatchingTfInstance(options: any): Promise<cp.ChildProcess> {
        if (!this._runningInstance || !this.optionsMatch(options, this._options)) {
            if (this._runningInstance) {
                this._runningInstance.kill();
            }
            // spawn a new instance of TF with these options
            await this.startNewTfInstance(options);
        }
        return this._runningInstance;
    }

    private async startNewTfInstance(options: any) {
        // Start up a new instance of TF for later use
        this._options = options;
        this._runningInstance = await this.spawn(options);
    }

    private optionsMatch(options1: any, options2: any): boolean {
        return (!options1 && !options2) || (options1.cwd === options2.cwd);
    }

    private async spawn(options: any): Promise<cp.ChildProcess> {
        if (!options) {
            options = {};
        }
        options.env = _.assign({}, process.env, options.env || {});

        const start: number = new Date().getTime();
        options.stdio = ["pipe", "pipe", "pipe"];
        const child: cp.ChildProcess = await cp.spawn(this._location, ["@"], options);
        const end: number = new Date().getTime();
        Logger.LogDebug(`TFVC: spawned new process (duration: ${end - start}ms)`);
        return child;
    }

    private async runCommand(argsForStandardInput: string, child: cp.ChildProcess, isExe: boolean): Promise<IExecutionResult> {
        const disposables: IDisposable[] = [];

        child.stdin.end(argsForStandardInput, "utf8");

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
                on(child.stdout, "data", b => {
                    buffers.push(b);
                });
                once(child.stdout, "close", () => {
                    let stdout: string = buffers.join("");
                    if (isExe) {
                        // TF.exe repeats the command line as part of the standard out when using the @ response file options
                        // So, we look for the noprompt option to let us know where that line is so we can strip it off
                        const start: number = stdout.indexOf("-noprompt");
                        if (start >= 0) {
                            const end: number = stdout.indexOf("\n", start);
                            stdout = stdout.slice(end + 1);
                        }
                    }
                    c(stdout);
                });
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
}

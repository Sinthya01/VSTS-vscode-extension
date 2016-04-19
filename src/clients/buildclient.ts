/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { StatusBarItem } from "vscode";
import { BuildResult, BuildStatus } from "vso-node-api/interfaces/BuildInterfaces";
import { BaseClient } from "./baseclient";
import { Logger } from "../helpers/logger";
import { BuildService } from "../services/build";
import { TeamServerContext} from "../contexts/servercontext";
import { CommandNames, TelemetryEvents, WellKnownRepositoryTypes } from "../helpers/constants";
import { Strings } from "../helpers/strings";
import { Utils } from "../helpers/utils";
import { VsCodeUtils } from "../helpers/vscode";
import { TelemetryService } from "../services/telemetry";
import { GitContext } from "../contexts/gitcontext";

/* tslint:disable:no-unused-variable */
import Q = require("q");
/* tslint:enable:no-unused-variable */

export class BuildClient extends BaseClient {
    private _serverContext: TeamServerContext;
    private _statusBarItem: StatusBarItem;
    private _buildSummaryUrl: string;

    constructor(context: TeamServerContext, telemetryService: TelemetryService, statusBarItem: StatusBarItem) {
        super(telemetryService);

        this._serverContext = context;
        this._statusBarItem = statusBarItem;
    }

    //Gets any available build status information and adds it to the status bar
    public DisplayCurrentBranchBuildStatus(context: GitContext, polling: boolean): void {
        let svc: BuildService = new BuildService(this._serverContext);

        Logger.LogInfo("Getting current build from badge...");
        svc.GetBuildBadge(this._serverContext.RepoInfo.TeamProject, WellKnownRepositoryTypes.TfsGit, this._serverContext.RepoInfo.RepositoryId, context.CurrentRef).then((buildBadge) => {
            if (buildBadge.buildId !== undefined) {
                Logger.LogInfo("Found build id " + buildBadge.buildId.toString() + ". Getting build details...");
                svc.GetBuildById(buildBadge.buildId).then((build) => {
                    this._buildSummaryUrl = BuildService.GetBuildSummaryUrl(this._serverContext.RepoInfo.TeamProjectUrl, build.id.toString());
                    Logger.LogInfo("Build summary info: " + build.id.toString() + " " + BuildStatus[build.status] +
                        " " + BuildResult[build.result] + " " + this._buildSummaryUrl);

                    if (this._statusBarItem !== undefined) {
                        let icon: string = Utils.GetBuildResultIcon(build.result);
                        this._statusBarItem.command = CommandNames.OpenBuildSummaryPage;
                        this._statusBarItem.text = `$(icon octicon-package) ` + `$(icon ${icon})`;
                        this._statusBarItem.tooltip = "(" + BuildResult[build.result] + ") " + Strings.NavigateToBuildSummary + " " + build.buildNumber;
                    }
                }).fail((reason) => {
                    this.handleError(reason, polling, "Failed to get build details by id");
                });
            } else {
                Logger.LogInfo("No builds were found for team " + this._serverContext.RepoInfo.TeamProject.toString() + ", repo type git, " +
                    "repo id " + this._serverContext.RepoInfo.RepositoryId.toString() + ", + branch " + (context.CurrentBranch === null ? "UNKNOWN" : context.CurrentBranch.toString()));
                if (this._statusBarItem !== undefined) {
                    this._statusBarItem.command = CommandNames.OpenBuildSummaryPage;
                    this._statusBarItem.text = `$(icon octicon-package) ` + `$(icon octicon-dash)`;
                    this._statusBarItem.tooltip = Strings.NoBuildsFound;
                }
            }
        }).fail((reason) => {
            this.handleError(reason, polling, "Failed to get current branch build status");
        });
    }

    public OpenBuildSummaryPage(): void {
        this.ReportEvent(TelemetryEvents.OpenBuildSummaryPage);
        let url: string = this._buildSummaryUrl;
        if (url === undefined) {
            Logger.LogInfo("No build summary available, using build definitions url.");
            url = BuildService.GetBuildDefinitionsUrl(this._serverContext.RepoInfo.TeamProjectUrl);
        }
        Logger.LogInfo("OpenBuildSummaryPage: " + url);
        Utils.OpenUrl(url);
    }

    private handleError(reason: any, polling: boolean, infoMessage?: string) : void {
        let offline: boolean = Utils.IsOffline(reason);
        let msg: string = Utils.GetMessageForStatusCode(reason, reason.message);
        let logPrefix: string = (infoMessage === undefined) ? "" : infoMessage + " ";

        //When polling, we never display an error, we only log it (no telemetry either)
        if (polling === true) {
            Logger.LogError(logPrefix + msg);
            if (offline === true) {
                if (this._statusBarItem !== undefined) {
                    this._statusBarItem.text = BuildClient.GetOfflineBuildStatusText();
                    this._statusBarItem.tooltip = Strings.StatusCodeOffline + " " + Strings.ClickToRetryConnection;
                    this._statusBarItem.command = CommandNames.RefreshPollingStatus;
                }
            } else {
                //Could happen if PAT doesn't have proper permissions
                if (this._statusBarItem !== undefined) {
                    this._statusBarItem.text = BuildClient.GetOfflineBuildStatusText();
                    this._statusBarItem.tooltip = msg;
                }
            }
        //If we aren't polling, we always log an error and, optionally, send telemetry
        } else {
            if (offline === true) {
                Logger.LogError(logPrefix + msg);
            } else {
                this.ReportError(logPrefix + msg);
            }
            VsCodeUtils.ShowErrorMessage(msg);
        }
    }

    public static GetOfflineBuildStatusText() : string {
        return `$(icon octicon-package) ` + `???`;
    }
}

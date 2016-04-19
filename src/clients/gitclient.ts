/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { StatusBarItem, window } from "vscode";
import { PullRequestStatus} from "vso-node-api/interfaces/GitInterfaces";
import { BaseClient } from "./baseclient";
import { BaseQuickPickItem } from "../helpers/vscode";
import { CommandNames, TelemetryEvents } from "../helpers/constants";
import { Logger } from "../helpers/logger";
import { Strings } from "../helpers/strings";
import { Utils } from "../helpers/utils";
import { VsCodeUtils } from "../helpers/vscode";
import { GitContext } from "../contexts/gitcontext";
import { TeamServerContext} from "../contexts/servercontext";
import { TelemetryService } from "../services/telemetry";
import { GitVcService, PullRequestScore } from "../services/gitvc";

/* tslint:disable:no-unused-variable */
import Q = require("q");
/* tslint:enable:no-unused-variable */

var path = require("path");

export class GitClient extends BaseClient {
    private _serverContext: TeamServerContext;
    private _statusBarItem: StatusBarItem;

    constructor(context: TeamServerContext, telemetryService: TelemetryService, statusBarItem: StatusBarItem) {
        super(telemetryService);

        this._serverContext = context;
        this._statusBarItem = statusBarItem;
    }

    //Opens the pull request page given the remote and (current) branch
    public CreatePullRequest(context: GitContext): void {
        this.ReportEvent(TelemetryEvents.OpenNewPullRequest);
        let pullRequestUrl: string = GitVcService.GetCreatePullRequestUrl(context.RemoteUrl, context.CurrentBranch);
        Logger.LogInfo("OpenPullRequest: " + pullRequestUrl);
        Utils.OpenUrl(pullRequestUrl);
    }

    //Initial method to display, select and navigate to my pull requests
    public GetMyPullRequests(): void {
        let self = this;
        this.ReportEvent(TelemetryEvents.ViewPullRequests);

        window.showQuickPick(this.getMyPullRequests(false), { matchOnDescription: true, placeHolder: Strings.ChoosePullRequest }).then(
            function (request) {
                if (request) {
                    self.ReportEvent(TelemetryEvents.ViewPullRequest);
                    let discUrl: string = undefined;
                    if (request.id !== undefined) {
                        discUrl = GitVcService.GetPullRequestDiscussionUrl(self._serverContext.RepositoryUrl, request.id);
                    } else {
                        discUrl = GitVcService.GetPullRequestsUrl(self._serverContext.RepositoryUrl);
                    }
                    Logger.LogInfo("Pull Request Url: " + discUrl);
                    Utils.OpenUrl(discUrl);
                }
            },
            function (err) {
                let msg: string = Utils.GetMessageForStatusCode(0, err.message, "Error selecting pull request from QuickPick");
                self.ReportError(msg);
            }
        );
    }

    //Opens the blame page for the currently active file
    public OpenBlamePage(context: GitContext): void {
        let url: string = undefined;

        let editor = window.activeTextEditor;
        if (editor) {
            this.ReportEvent(TelemetryEvents.OpenBlamePage);

            //Get the relative file path we can use to create the url
            let relativePath: string = "\\" + path.relative(context.RepositoryParentFolder, editor.document.fileName);
            relativePath = relativePath.split("\\").join("/");  //Replace all

            url = GitVcService.GetFileBlameUrl(context.RemoteUrl, relativePath, context.CurrentBranch);
            //Note: if file hasn't been pushed yet, blame link we generate won't point to anything valid (basically a 404)
            Logger.LogInfo("OpenBlame: " + url);
            Utils.OpenUrl(url);
        } else {
            let msg: string = Utils.GetMessageForStatusCode(0, Strings.NoSourceFileForBlame);
            Logger.LogError(msg);
            VsCodeUtils.ShowErrorMessage(msg);
        }
    }

    //Opens the file history page for the currently active file
    public OpenFileHistory(context: GitContext): void {
        let historyUrl: string = undefined;

        let editor = window.activeTextEditor;
        if (!editor) {
            this.ReportEvent(TelemetryEvents.OpenRepositoryHistory);

            historyUrl = GitVcService.GetRepositoryHistoryUrl(context.RemoteUrl, context.CurrentBranch);
            Logger.LogInfo("OpenRepoHistory: " + historyUrl);
        } else {
            this.ReportEvent(TelemetryEvents.OpenFileHistory);

            //Get the relative file path we can use to create the history url
            let relativePath: string = "\\" + path.relative(context.RepositoryParentFolder, editor.document.fileName);
            relativePath = relativePath.split("\\").join("/");  //Replace all

            historyUrl = GitVcService.GetFileHistoryUrl(context.RemoteUrl, relativePath, context.CurrentBranch);
            //Note: if file hasn't been pushed yet, history link we generate won't point to anything valid (basically a 404)
            Logger.LogInfo("OpenFileHistory: " + historyUrl);
        }

        Utils.OpenUrl(historyUrl);
    }

    public OpenNewPullRequest(remoteUrl: string, currentBranch: string): void {
        this.ReportEvent(TelemetryEvents.OpenNewPullRequest);

        let url: string = GitVcService.GetCreatePullRequestUrl(remoteUrl, currentBranch);
        Logger.LogInfo("CreatePullRequestPage: " + url);
        Utils.OpenUrl(url);
    }

    public OpenPullRequestsPage(): void {
        this.ReportEvent(TelemetryEvents.OpenPullRequestsPage);

        let url: string = GitVcService.GetPullRequestsUrl(this._serverContext.RepositoryUrl);
        Logger.LogInfo("OpenPullRequestsPage: " + url);
        Utils.OpenUrl(url);
    }

    public PollMyPullRequests(): void {
        this.getMyPullRequests(true).then((requests) => {
            this._statusBarItem.tooltip = Strings.BrowseYourPullRequests;
            //Remove the default Strings.BrowseYourPullRequests item from the calculation
            this._statusBarItem.text = GitClient.GetPullRequestStatusText(requests.length - 1);
        }).catch((reason) => {
            //Nothing to do
        });
    }

    private getMyPullRequests(polling: boolean): Q.Promise<Array<BaseQuickPickItem>> {
        let requestItems: Array<BaseQuickPickItem> = [];
        let requestIds: Array<number> = [];

        let promiseToReturn: Q.Promise<Array<BaseQuickPickItem>>;
        let deferred = Q.defer<Array<BaseQuickPickItem>>();
        promiseToReturn = deferred.promise;

        Logger.LogInfo("Getting pull requests that I requested...");
        let svc: GitVcService = new GitVcService(this._serverContext);
        svc.GetPullRequests(this._serverContext.RepositoryId, this._serverContext.UserInfo.Id, undefined, PullRequestStatus.Active).then((myPullRequests) => {
            let icon: string = "octicon-search";
            let label: string = `$(icon ${icon}) `;
            requestItems.push({ label: label + Strings.BrowseYourPullRequests, description: undefined, id: undefined });

            myPullRequests.forEach(pr => {
                let score: PullRequestScore = GitVcService.GetPullRequestScore(pr);
                requestItems.push(this.getPullRequestLabel(pr.createdBy.displayName, pr.title, pr.description, pr.pullRequestId.toString(), score));
                requestIds.push(pr.pullRequestId);
            });
            Logger.LogInfo("Retrieved " + myPullRequests.length + " pull requests that I requested");

            Logger.LogInfo("Getting pull requests for which I'm a reviewer...");
            //Go get the active pull requests that I'm a reviewer for
            svc.GetPullRequests(this._serverContext.RepositoryId, undefined, this._serverContext.UserInfo.Id, PullRequestStatus.Active).then((myReviewPullRequests) => {
                myReviewPullRequests.forEach(pr => {
                    let score: PullRequestScore = GitVcService.GetPullRequestScore(pr);
                    if (requestIds.indexOf(pr.pullRequestId) < 0) {
                        requestItems.push(this.getPullRequestLabel(pr.createdBy.displayName, pr.title, pr.description, pr.pullRequestId.toString(), score));
                    }
                });
                Logger.LogInfo("Retrieved " + myReviewPullRequests.length + " pull requests that I'm the reviewer");

                //Remove the default Strings.BrowseYourPullRequests item from the calculation
                this._statusBarItem.text = GitClient.GetPullRequestStatusText(requestItems.length - 1);
                this._statusBarItem.tooltip = Strings.BrowseYourPullRequests;
                this._statusBarItem.command = CommandNames.GetPullRequests;

                deferred.resolve(requestItems);
            }).catch((reason) => {
                this.handleError(reason, polling, "Attempting to get pull requests that I'm the reviewer");
                deferred.reject(reason);
            });
        }).catch((reason) => {
            this.handleError(reason, polling, "Attempting to get pull requests that I requested");
            deferred.reject(reason);
        });

        return promiseToReturn;
    }

    private getPullRequestLabel(displayName: string, title: string, description: string, id: string, score: PullRequestScore): BaseQuickPickItem {
        let scoreIcon: string = "";
        if (score === PullRequestScore.Succeeded) {
            scoreIcon = "octicon-check";
        } else if (score === PullRequestScore.Failed) {
            scoreIcon = "octicon-stop";
        } else if (score === PullRequestScore.Waiting) {
            scoreIcon = "octicon-watch";
        } else if (score === PullRequestScore.NoResponse) {
            scoreIcon = "octicon-git-pull-request";
        }
        let scoreLabel: string = `$(icon ${scoreIcon}) `;

        return { label: scoreLabel + " (" + displayName + ") " + title, description: description, id: id };
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
                    this._statusBarItem.text = GitClient.GetOfflinePullRequestStatusText();
                    this._statusBarItem.tooltip = Strings.StatusCodeOffline + " " + Strings.ClickToRetryConnection;
                    this._statusBarItem.command = CommandNames.RefreshPollingStatus;
                }
            } else {
                //Could happen if PAT doesn't have proper permissions
                if (this._statusBarItem !== undefined) {
                    this._statusBarItem.text = GitClient.GetOfflinePullRequestStatusText();
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

    public static GetOfflinePullRequestStatusText() : string {
        return `$(icon octicon-git-pull-request) ` + `???`;
    }

    //Sets the text on the pull request status bar
    public static GetPullRequestStatusText(total: number) : string {
        let octipullrequest: string = "octicon-git-pull-request";

        return `$(icon ${octipullrequest}) ` + total.toString();
    }
}

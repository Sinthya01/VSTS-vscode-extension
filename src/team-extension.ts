/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { FileSystemWatcher, StatusBarAlignment, StatusBarItem, window, workspace } from "vscode";
import { Settings } from "./helpers/settings";
import { CommandNames, TelemetryEvents, WitTypes } from "./helpers/constants";
import { Logger } from "./helpers/logger";
import { Strings } from "./helpers/strings";
import { Utils } from "./helpers/utils";
import { VsCodeUtils } from "./helpers/vscode";
import { GitContext } from "./contexts/gitcontext";
import { TeamServerContext} from "./contexts/servercontext";
import { TelemetryService } from "./services/telemetry";
import { QTeamServicesApi, TeamServicesClient } from "./clients/teamservicesclient";
import { BuildClient } from "./clients/buildclient";
import { GitClient } from "./clients/gitclient";
import { WitClient } from "./clients/witclient";
import { UserInfo } from "./info/userinfo";

export class TeamExtension  {
    private _teamServicesStatusBarItem: StatusBarItem;
    private _buildStatusBarItem: StatusBarItem;
    private _pullRequestStatusBarItem: StatusBarItem;
    private _errorMessage: string;
    private _telemetry: TelemetryService;
    private _accountClient: QTeamServicesApi;
    private _repositoryClient: QTeamServicesApi;
    private _buildClient: BuildClient;
    private _gitClient: GitClient;
    private _witClient: WitClient;
    private _teamServicesClient: TeamServicesClient;
    private _serverContext: TeamServerContext;
    private _gitContext: GitContext;
    private _settings: Settings;

    constructor() {
        this.initializeExtension();

        // Add the event listener for settings changes, then re-initialized the extension
        workspace.onDidChangeConfiguration(() => {
            this.Reinitialize();
        });
    }

    //Opens the pull request page given the remote and (current) branch
    public CreatePullRequest(): void {
        if (this.ensureInitialized()) {
            this._gitClient.CreatePullRequest(this._gitContext);
        } else {
            VsCodeUtils.ShowErrorMessage(this._errorMessage);
        }
    }

    //Gets any available build status information and adds it to the status bar
    public DisplayCurrentBranchBuildStatus(): void {
        if (this.ensureInitialized()) {
            this._buildClient.DisplayCurrentBranchBuildStatus(this._gitContext, false);
        } else {
            VsCodeUtils.ShowErrorMessage(this._errorMessage);
        }
    }

    //Initial method to display, select and navigate to my pull requests
    public GetMyPullRequests(): void {
        if (this.ensureInitialized()) {
            this._gitClient.GetMyPullRequests();
        } else {
            VsCodeUtils.ShowErrorMessage(this._errorMessage);
        }
    }

    //Opens the build summary page for a particular build
    public OpenBlamePage(): void {
        if (this.ensureInitialized()) {
            this._gitClient.OpenBlamePage(this._gitContext);
        } else {
            VsCodeUtils.ShowErrorMessage(this._errorMessage);
        }
    }

    //Opens the build summary page for a particular build
    public OpenBuildSummaryPage(): void {
        if (this.ensureInitialized()) {
            this._buildClient.OpenBuildSummaryPage();
        } else {
            VsCodeUtils.ShowErrorMessage(this._errorMessage);
        }
    }

    //Opens the file history page for the currently active file
    public OpenFileHistory(): void {
        if (this.ensureInitialized()) {
            this._gitClient.OpenFileHistory(this._gitContext);
        } else {
            VsCodeUtils.ShowErrorMessage(this._errorMessage);
        }
    }

    //Opens a browser to a new Bug
    public OpenNewBug(): void {
        if (this.ensureInitialized()) {
            //Bug is in all three templates
            let taskTitle = VsCodeUtils.GetActiveSelection();
            this._witClient.CreateNewItem(WitTypes.Bug, taskTitle);
        } else {
            VsCodeUtils.ShowErrorMessage(this._errorMessage);
        }
    }

    //Opens a browser to a new pull request for the current branch
    public OpenNewPullRequest(): void {
        if (this.ensureInitialized()) {
            this._gitClient.OpenNewPullRequest(this._gitContext.RemoteUrl, this._gitContext.CurrentBranch);
        } else {
            VsCodeUtils.ShowErrorMessage(this._errorMessage);
        }
    }

    //Opens a browser to a new Task
    public OpenNewTask(): void {
        if (this.ensureInitialized()) {
            //Issue is only in Agile and CMMI templates (not Scrum)
            //Task is in all three templates (Agile, CMMI, Scrum)
            let taskTitle = VsCodeUtils.GetActiveSelection();
            this._witClient.CreateNewItem(WitTypes.Task, taskTitle);
        } else {
            VsCodeUtils.ShowErrorMessage(this._errorMessage);
        }
    }

    //Opens a browser to a new work item (based on the work item type selected)
    public OpenNewWorkItem(): void {
        if (this.ensureInitialized()) {
            let taskTitle = VsCodeUtils.GetActiveSelection();
            this._witClient.CreateNewWorkItem(taskTitle);
        } else {
            VsCodeUtils.ShowErrorMessage(this._errorMessage);
        }
    }

    //Opens the main pull requests page
    public OpenPullRequestsPage(): void {
        if (this.ensureInitialized()) {
            this._gitClient.OpenPullRequestsPage();
        } else {
            VsCodeUtils.ShowErrorMessage(this._errorMessage);
        }
    }

    //Opens the team project web site
    public OpenTeamProjectWebSite(): void {
        if (this.ensureInitialized()) {
            this._telemetry.SendEvent(TelemetryEvents.OpenTeamSite);
            Logger.LogInfo("OpenTeamProjectWebSite: " + this._serverContext.TeamProjectUrl);
            Utils.OpenUrl(this._serverContext.TeamProjectUrl);
        } else {
            VsCodeUtils.ShowErrorMessage(this._errorMessage);
        }
    }

    //Meant to be used when coming back online via status bar items
    public RefreshPollingStatus(): void {
        if (this.ensureInitialized()) {
            this.refreshPollingItems();
        } else {
            VsCodeUtils.ShowErrorMessage(this._errorMessage);
        }
    }

    //Meant to reinitialize the extension when coming back online
    public Reinitialize(): void {
        this.dispose();
        this.initializeExtension();
    }

    //Prompts for either a smile or frown, feedback text and an optional email address
    public SendFeedback(): void {
        if (this.ensureInitialized()) {
            return this._teamServicesClient.SendFeedback();
        } else {
            VsCodeUtils.ShowErrorMessage(this._errorMessage);
        }
    }

    //Returns the list of work items assigned directly to the current user
    public ViewMyWorkItems(): void {
        if (this.ensureInitialized()) {
            this._witClient.ShowMyWorkItems();
        } else {
            VsCodeUtils.ShowErrorMessage(this._errorMessage);
        }
    }

    //Navigates to a work item chosen from the results of a user-selected "My Queries" work item query
    //This method first displays the queries under "My Queries" and, when one is chosen, displays the associated work items.
    //If a work item is chosen, it is opened in the web browser.
    public ViewWorkItems(): void {
        if (this.ensureInitialized()) {
            this._witClient.ShowMyWorkItemQueries();
        } else {
            VsCodeUtils.ShowErrorMessage(this._errorMessage);
        }
    }

    private ensureInitialized(): boolean {
        if (this._gitContext === undefined
                || this._gitContext.RemoteUrl === undefined
                || this._serverContext === undefined
                || this._serverContext.IsTeamServices === false) {
            this.setErrorStatus(Strings.NoGitRepoInformation);
            return true;
        } else if (this._errorMessage !== undefined) {
            return false;
        }
        return true;
    }

    private initializeExtension() : void {
        this._gitContext = new GitContext(workspace.rootPath);
        if (this._gitContext !== undefined && this._gitContext.RemoteUrl !== undefined && this._gitContext.IsTeamServices) {
            this.setupFileSystemWatcherOnHead();

            this._serverContext = new TeamServerContext(this._gitContext.RemoteUrl);
            this._settings = new Settings(this._serverContext.Account);
            this.logStart(this._settings.LoggingLevel, workspace.rootPath);
            if (this._settings.TeamServicesPersonalAccessToken === undefined) {
                Logger.LogError(Strings.NoAccessTokenFound);
                this._errorMessage = Strings.NoAccessTokenFound;
                VsCodeUtils.ShowErrorMessage(Strings.NoAccessTokenFound);
                return;
            }

            this._teamServicesStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 100);
            this._serverContext.SetCredentialHandler(this._settings.TeamServicesPersonalAccessToken);

            this._telemetry = new TelemetryService(this._serverContext, this._settings);
            Logger.LogDebug("Started ApplicationInsights telemetry");

            //Go get the details about the repository
            this._repositoryClient = new QTeamServicesApi(this._gitContext.RemoteUrl, [this._serverContext.CredentialHandler]);
            Logger.LogInfo("Getting repository information (vsts/info) with repositoryClient");
            this._repositoryClient.getVstsInfo().then((repoInfo) => {
                Logger.LogInfo("Retrieved repository info with repositoryClient");
                Logger.LogObject(repoInfo);

                this._serverContext.UpdateValues(repoInfo);
                //Now we need to go and get the authorized user information
                this._accountClient = new QTeamServicesApi(this._serverContext.AccountUrl, [this._serverContext.CredentialHandler]);
                Logger.LogInfo("Getting connectionData with accountClient");
                this._accountClient.connect().then((settings) => {
                    Logger.LogInfo("Retrieved connectionData with accountClient");
                    this.resetErrorStatus();

                    this._serverContext.UserInfo = new UserInfo(settings.authenticatedUser.id,
                                                                settings.authenticatedUser.providerDisplayName,
                                                                settings.authenticatedUser.customDisplayName);
                    this._telemetry.Update(this._serverContext.CollectionId, this._serverContext.UserInfo.Id);

                    this.initializeStatusBars();
                    this._buildClient = new BuildClient(this._serverContext, this._telemetry, this._buildStatusBarItem);
                    this._gitClient = new GitClient(this._serverContext, this._telemetry, this._pullRequestStatusBarItem);
                    this._witClient = new WitClient(this._serverContext, this._telemetry);
                    this._teamServicesClient = new TeamServicesClient(this._serverContext, this._telemetry);
                    this._telemetry.SendEvent(TelemetryEvents.StartUp);

                    Logger.LogObject(settings);
                    this.logDebugInformation();
                    this.refreshPollingItems();
                    this.startPolling();
                }).fail((reason) => {
                    this.setErrorStatus(Utils.GetMessageForStatusCode(reason, reason.message));
                    this.reportError(Utils.GetMessageForStatusCode(reason, reason.message, "Failed to get results with accountClient: "));
                });
            }).fail((reason) => {
                this.setErrorStatus(Utils.GetMessageForStatusCode(reason, reason.message));
                this.reportError(Utils.GetMessageForStatusCode(reason, reason.message, "Failed (vsts/info) call with repositoryClient: "));
            });
        }
    }

    //Set up the initial status bars
    private initializeStatusBars() {
        if (this.ensureInitialized()) {
            this._teamServicesStatusBarItem.command = CommandNames.OpenTeamSite;
            this._teamServicesStatusBarItem.text = this._serverContext.TeamProject;
            this._teamServicesStatusBarItem.tooltip = Strings.NavigateToTeamServicesWebSite;
            this._teamServicesStatusBarItem.show();

            this._pullRequestStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 99);
            this._pullRequestStatusBarItem.command = CommandNames.GetPullRequests;
            this._pullRequestStatusBarItem.text = GitClient.GetPullRequestStatusText(0);
            this._pullRequestStatusBarItem.tooltip = Strings.BrowseYourPullRequests;
            this._pullRequestStatusBarItem.show();

            this._buildStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 98);
            this._buildStatusBarItem.command = CommandNames.OpenBuildSummaryPage;
            this._buildStatusBarItem.text = `$(icon octicon-package) ` + `$(icon octicon-dash)`;
            this._buildStatusBarItem.tooltip = Strings.NoBuildsFound;
            this._buildStatusBarItem.show();
        }
    }

    private logDebugInformation(): void {
        Logger.LogDebug("Acct: " + this._serverContext.Account + " "
                            + "TP: " + this._serverContext.TeamProject + " "
                            + "Coll: " + this._serverContext.CollectionName + " "
                            + "Repo: " + this._serverContext.RepositoryName + " "
                            + "UserCustomDisplayName: " + this._serverContext.UserInfo.CustomDisplayName + " "
                            + "UserProviderDisplayName: " + this._serverContext.UserInfo.ProviderDisplayName + " "
                            + "UserId: " + this._serverContext.UserInfo.Id + " ");
        Logger.LogDebug("gitFolder: " + this._gitContext.GitFolder);
        Logger.LogDebug("gitRemoteUrl: " + this._gitContext.RemoteUrl);
        Logger.LogDebug("gitRepositoryParentFolder: " + this._gitContext.RepositoryParentFolder);
        Logger.LogDebug("gitCurrentBranch: " + this._gitContext.CurrentBranch);
        Logger.LogDebug("gitCurrentRef: " + this._gitContext.CurrentRef);
        Logger.LogDebug("gitIsSsh: " + this._gitContext.IsSsh);
    }

    private logStart(loggingLevel: string, rootPath: string): void {
        if (loggingLevel === undefined) {
            console.log("Logging is disabled.");
            return;
        }
        Logger.SetLoggingLevel(loggingLevel);
        if (rootPath !== undefined) {
            Logger.SetLogPath(rootPath);
            Logger.LogInfo("*** FOLDER: " + rootPath + " ***");
        } else {
            Logger.LogInfo("*** Folder not opened ***");
        }
    }

    private pollBuildStatus(): void {
        if (this.ensureInitialized()) {
            this._buildClient.DisplayCurrentBranchBuildStatus(this._gitContext, true);
        }
    }

    private pollMyPullRequests(): void {
        if (this.ensureInitialized()) {
            this._gitClient.PollMyPullRequests();
        }
    }

    //Polls for latest pull requests and current branch build status information
    private refreshPollingItems(): void {
        Logger.LogInfo("Polling for pull requests...");
        this.pollMyPullRequests();
        Logger.LogInfo("Polling for latest current branch build status...");
        this.pollBuildStatus();
    }

    //Logs an error to the logger and sends an exception to telemetry service
    private reportError(message: string): void {
        Logger.LogError(message);
        this._telemetry.SendException(message);
    }

    private resetErrorStatus() {
        this._errorMessage = undefined;
    }

    private setErrorStatus(message: string) {
        this._errorMessage = message;
        if (this._teamServicesStatusBarItem !== undefined) {
            this._teamServicesStatusBarItem.command = CommandNames.Reinitialize;
            this._teamServicesStatusBarItem.text = "Team " + `$(icon octicon-stop)`;
            this._teamServicesStatusBarItem.tooltip = this._errorMessage + " " + Strings.ClickToRetryConnection;
            this._teamServicesStatusBarItem.show();
        }
    }

    //Sets up a file system watcher on HEAD so we can know when the current branch has changed
    private setupFileSystemWatcherOnHead(): void {
        let pattern: string = this._gitContext.GitFolder + "/HEAD";
        let fsw:FileSystemWatcher = workspace.createFileSystemWatcher(pattern, true, false, true);
        fsw.onDidChange((uri) => {
            Logger.LogInfo("HEAD has changed, re-parsing GitContext object");
            this._gitContext = new GitContext(workspace.rootPath);
            Logger.LogInfo("CurrentBranch is: " + this._gitContext.CurrentBranch);
            this.refreshPollingItems();
        });
    }

    //Sets up the interval to refresh polling items
    private startPolling(): void {
        setInterval(() => this.refreshPollingItems(), 1000 * 60 * this._settings.PollingInterval);
    }

    dispose() {
        if (this._pullRequestStatusBarItem !== undefined) {
            this._pullRequestStatusBarItem.dispose();
        }
        if (this._teamServicesStatusBarItem !== undefined) {
            this._teamServicesStatusBarItem.dispose();
        }
        if (this._buildStatusBarItem !== undefined) {
            this._buildStatusBarItem.dispose();
        }
    }
}

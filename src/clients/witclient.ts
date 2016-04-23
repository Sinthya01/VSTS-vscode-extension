/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { StatusBarItem, window } from "vscode";
import { BaseClient } from "./baseclient";
import { Logger } from "../helpers/logger";
import { WorkItemTrackingService } from "../services/workitemtracking";
import { TeamServerContext} from "../contexts/servercontext";
import { BaseQuickPickItem, WorkItemQueryQuickPickItem } from "../helpers/vscode";
import { CommandNames, TelemetryEvents, WitQueries, WitTypes } from "../helpers/constants";
import { Strings } from "../helpers/strings";
import { Utils } from "../helpers/utils";
import { VsCodeUtils } from "../helpers/vscode";
import { TelemetryService } from "../services/telemetry";

import Q = require("q");

export class WitClient extends BaseClient {
    private _serverContext: TeamServerContext;
    private _statusBarItem: StatusBarItem;
    private _pinnedQueryText: string;

    constructor(context: TeamServerContext, telemetryService: TelemetryService, pinnedQueryText: string, statusBarItem: StatusBarItem) {
        super(telemetryService);

        this._serverContext = context;
        this._statusBarItem = statusBarItem;
        this._pinnedQueryText = pinnedQueryText;
    }

    //Opens a browser to a new work item given the item type, title and assigned to
    public CreateNewItem(itemType: string, taskTitle: string): void {
        this.logTelemetryForWorkItem(itemType);
        Logger.LogInfo("Work item type is " + itemType);
        let newItemUrl: string = WorkItemTrackingService.GetNewWorkItemUrl(this._serverContext.RepoInfo.TeamProjectUrl, itemType, taskTitle, this.getUserName(this._serverContext));
        Logger.LogInfo("New Work Item Url: " + newItemUrl);
        Utils.OpenUrl(newItemUrl);
    }

    //Creates a new work item based on a single line of selected text
    public CreateNewWorkItem(taskTitle: string): void {
        let self = this;
        this.ReportEvent(TelemetryEvents.OpenNewWorkItem);

        window.showQuickPick(this.getWorkItemTypes(), { matchOnDescription: true, placeHolder: Strings.ChooseWorkItemType }).then(
            function (selectedType) {
                if (selectedType) {
                    self.ReportEvent(TelemetryEvents.OpenNewWorkItem);

                    Logger.LogInfo("Selected work item type is " + selectedType.label);
                    let newItemUrl: string = WorkItemTrackingService.GetNewWorkItemUrl(self._serverContext.RepoInfo.TeamProjectUrl, selectedType.label, taskTitle, self.getUserName(self._serverContext));
                    Logger.LogInfo("New Work Item Url: " + newItemUrl);
                    Utils.OpenUrl(newItemUrl);
                }
            },
            function (err) {
                self.handleError(err, "Error selecting work item type from QuickPick");
            }
        );
    }

    //Navigates to a work item chosen from the results of a user-selected "My Queries" work item query
    //This method first displays the queries under "My Queries" and, when one is chosen, displays the associated work items.
    //If a work item is chosen, it is opened in the web browser.
    public ShowMyWorkItemQueries(): void {
        let self = this;
        this.ReportEvent(TelemetryEvents.ShowMyWorkItemQueries);

        window.showQuickPick(this.getMyWorkItemQueries(), { matchOnDescription: false, placeHolder: Strings.ChooseWorkItemQuery }).then(
            function (query) {
                if (query) {
                    self.ReportEvent(TelemetryEvents.ViewWorkItems);
                    Logger.LogInfo("Selected query is " + query.label);
                    Logger.LogInfo("Getting work items for query...");

                    window.showQuickPick(self.getMyWorkItems(self._serverContext.RepoInfo.TeamProject, query.wiql), { matchOnDescription: true, placeHolder: Strings.ChooseWorkItem }).then(
                        function (workItem) {
                            if (workItem) {
                                let url: string = undefined;
                                if (workItem.id === undefined) {
                                    self.ReportEvent(TelemetryEvents.OpenAdditionalQueryResults);
                                    url = WorkItemTrackingService.GetMyQueryResultsUrl(self._serverContext.RepoInfo.TeamProjectUrl, query.label);
                                } else {
                                    self.ReportEvent(TelemetryEvents.ViewWorkItem);
                                    url = WorkItemTrackingService.GetEditWorkItemUrl(self._serverContext.RepoInfo.TeamProjectUrl, workItem.id);
                                }
                                Logger.LogInfo("Work Item Url: " + url);
                                Utils.OpenUrl(url);
                            }
                        },
                        function (err) {
                            self.handleError(err, "Error selecting work item from QuickPick");
                        }
                    );
                }
            },
            function (err) {
                self.handleError(err, "Error selecting work item query from QuickPick");
            }
        );
    }

    public ShowPinnedQueryWorkItems(): void {
        this.ReportEvent(TelemetryEvents.ViewPinnedQueryWorkItems);
        this.showWorkItems(this._pinnedQueryText);

    }

    //Returns a Q.Promise containing an array of SimpleWorkItems that are "My" work items
    public ShowMyWorkItems(): void {
        this.ReportEvent(TelemetryEvents.ViewMyWorkItems);
        this.showWorkItems(WitQueries.MyWorkItems);
    }

    private showWorkItems(wiql: string): void {
        let self = this;
        Logger.LogInfo("Getting work items...");
        window.showQuickPick(self.getMyWorkItems(this._serverContext.RepoInfo.TeamProject, wiql), { matchOnDescription: true, placeHolder: Strings.ChooseWorkItem }).then(
            function (workItem) {
                if (workItem) {
                    let url: string = undefined;
                    if (workItem.id === undefined) {
                        self.ReportEvent(TelemetryEvents.OpenAdditionalQueryResults);
                        url = WorkItemTrackingService.GetWorkItemsBaseUrl(self._serverContext.RepoInfo.TeamProjectUrl);
                    } else {
                        self.ReportEvent(TelemetryEvents.ViewWorkItem);
                        url = WorkItemTrackingService.GetEditWorkItemUrl(self._serverContext.RepoInfo.TeamProjectUrl, workItem.id);
                    }
                    Logger.LogInfo("Work Item Url: " + url);
                    Utils.OpenUrl(url);
                }
            },
            function (err) {
                self.handleError(err, "Error selecting work item query from QuickPick");
            }
        );
    }

    public GetPinnedQueryResultCount() : Q.Promise<number> {

        let svc: WorkItemTrackingService = new WorkItemTrackingService(this._serverContext);

        Logger.LogInfo("Running pinned work item query to get count...");
        Logger.LogInfo("TP: " + this._serverContext.RepoInfo.TeamProject);
        return svc.GetQueryResultCount(this._serverContext.RepoInfo.TeamProject, this._pinnedQueryText);

    }

    private getMyWorkItemQueries(): Q.Promise<Array<WorkItemQueryQuickPickItem>> {
        let queries: Array<WorkItemQueryQuickPickItem> = [];
        let promiseToReturn: Q.Promise<Array<WorkItemQueryQuickPickItem>>;
        let deferred = Q.defer<Array<WorkItemQueryQuickPickItem>>();
        promiseToReturn = deferred.promise;

        let svc: WorkItemTrackingService = new WorkItemTrackingService(this._serverContext);
        Logger.LogInfo("Getting my work item queries...");
        Logger.LogInfo("TP: " + this._serverContext.RepoInfo.TeamProject);
        svc.GetWorkItemHierarchyItems(this._serverContext.RepoInfo.TeamProject).then((hierarchyItems) => {
            Logger.LogInfo("Retrieved " + hierarchyItems.length + " hierarchyItems");
            hierarchyItems.forEach(folder => {
                if (folder && folder.name === WitQueries.MyQueriesFolder && folder.hasChildren === true) {
                    //Gets all of the queries under "My Queries" and gets their name and wiql
                    for (let index = 0; index < folder.children.length; index++) {
                        queries.push({
                            id: folder.children[index].id,
                            label: folder.children[index].name,
                            description: "",
                            wiql: folder.children[index].wiql
                        });
                    }
                }
            });

            deferred.resolve(queries);
        }).catch((reason) => {
            deferred.reject(reason);
        });

        return promiseToReturn;
    }

    private getMyWorkItems(teamProject: string, wiql: string): Q.Promise<Array<BaseQuickPickItem>> {
        let workItems: Array<BaseQuickPickItem> = [];
        let promiseToReturn: Q.Promise<Array<BaseQuickPickItem>>;
        let deferred = Q.defer<Array<BaseQuickPickItem>>();
        promiseToReturn = deferred.promise;

        let svc: WorkItemTrackingService = new WorkItemTrackingService(this._serverContext);
        Logger.LogInfo("Getting my work items...");
        Logger.LogInfo("TP: " + this._serverContext.RepoInfo.TeamProject);
        svc.GetWorkItems(teamProject, wiql).then((simpleWorkItems) => {
            Logger.LogInfo("Retrieved " + simpleWorkItems.length + " work items");

            simpleWorkItems.forEach(wi => {
                workItems.push({ label: wi.label, description: wi.description, id: wi.id});
            });
            if (simpleWorkItems.length === WorkItemTrackingService.MaxResults) {
                workItems.push({
                    id: undefined,
                    label: Strings.BrowseAdditionalWorkItems,
                    description: Strings.BrowseAdditionalWorkItemsDescription
                });
            }

            deferred.resolve(workItems);
        }).catch((reason) => {
            deferred.reject(reason);
        });

        return promiseToReturn;
    }

    private getUserName(context: TeamServerContext): string {
        let userName: string = undefined;
        Logger.LogDebug("UserCustomDisplayName: " + context.UserInfo.CustomDisplayName);
        Logger.LogDebug("UserProviderDisplayName: " + context.UserInfo.ProviderDisplayName);
        if (context.UserInfo.CustomDisplayName !== undefined) {
            userName = context.UserInfo.CustomDisplayName;
        } else {
            userName = context.UserInfo.ProviderDisplayName;
        }
        Logger.LogDebug("User is " + userName);
        return userName;
    }

    private getWorkItemTypes(): Q.Promise<Array<BaseQuickPickItem>> {
        let promiseToReturn: Q.Promise<Array<BaseQuickPickItem>>;
        let deferred = Q.defer<Array<BaseQuickPickItem>>();
        promiseToReturn = deferred.promise;

        let svc: WorkItemTrackingService = new WorkItemTrackingService(this._serverContext);
        svc.GetWorkItemTypes(this._serverContext.RepoInfo.TeamProject).then((types) => {
            let workItemTypes: Array<BaseQuickPickItem> = [];
            types.forEach(type => {
                workItemTypes.push({ label: type.name, description: type.description, id: undefined });
            });
            workItemTypes.sort((t1, t2) => {
                return (t1.label.localeCompare(t2.label));
            });

            deferred.resolve(workItemTypes);
        }).catch((reason) => {
            deferred.reject(reason);
        });

        return promiseToReturn;
    }

    private handleError(reason: any, infoMessage?: string, polling?: boolean) : void {
        let offline: boolean = Utils.IsOffline(reason);
        let msg: string = Utils.GetMessageForStatusCode(reason, reason.message);
        let logPrefix: string = (infoMessage === undefined) ? "" : infoMessage + " ";

        //When polling, we never display an error, we only log it (no telemetry either)
        if (polling === true) {
            Logger.LogError(logPrefix + msg);
            if (offline === true) {
                if (this._statusBarItem !== undefined) {
                    this._statusBarItem.text = WitClient.GetOfflinePinnedQueryStatusText();
                    this._statusBarItem.tooltip = Strings.StatusCodeOffline + " " + Strings.ClickToRetryConnection;
                    this._statusBarItem.command = CommandNames.RefreshPollingStatus;
                }
            } else {
                //Could happen if PAT doesn't have proper permissions
                if (this._statusBarItem !== undefined) {
                    this._statusBarItem.text = WitClient.GetOfflinePinnedQueryStatusText();
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

    private logTelemetryForWorkItem(wit: string): void {
        switch (wit) {
            case WitTypes.Bug:
                this.ReportEvent(TelemetryEvents.OpenNewBug);
                break;
            case WitTypes.Task:
                this.ReportEvent(TelemetryEvents.OpenNewTask);
                break;
            default:
                break;
        }
    }

    public PollPinnedQuery(): void {
        this.GetPinnedQueryResultCount().then((items) => {
            this._statusBarItem.tooltip = Strings.ViewYourPinnedQuery;
            this._statusBarItem.text = WitClient.GetPinnedQueryStatusText(items);
        }).catch((reason) => {
            this.handleError(reason, "Failed to get pinned query count during polling", true);
        });
    }

   public static GetOfflinePinnedQueryStatusText() : string {
        return `$(icon octicon-bug) ` + `???`;
    }

    public static GetPinnedQueryStatusText(total: number) : string {
        let octibug: string = "octicon-bug";

        return `$(icon ${octibug}) ` + total.toString();
    }
}

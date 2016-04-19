/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { window } from "vscode";
import { BaseClient } from "./baseclient";
import { Logger } from "../helpers/logger";
import { WorkItemTrackingService } from "../services/workitemtracking";
import { TeamServerContext} from "../contexts/servercontext";
import { BaseQuickPickItem, WorkItemQueryQuickPickItem } from "../helpers/vscode";
import { TelemetryEvents, WitQueries, WitTypes } from "../helpers/constants";
import { Strings } from "../helpers/strings";
import { Utils } from "../helpers/utils";
import { VsCodeUtils } from "../helpers/vscode";
import { TelemetryService } from "../services/telemetry";

import Q = require("q");

export class WitClient extends BaseClient {
    private _serverContext: TeamServerContext;

    constructor(context: TeamServerContext, telemetryService: TelemetryService) {
        super(telemetryService);

        this._serverContext = context;
    }

    //Opens a browser to a new work item given the item type, title and assigned to
    public CreateNewItem(itemType: string, taskTitle: string): void {
        this.logTelemetryForWorkItem(itemType);
        Logger.LogInfo("Work item type is " + itemType);
        let newItemUrl: string = WorkItemTrackingService.GetNewWorkItemUrl(this._serverContext.TeamProjectUrl, itemType, taskTitle, this.getUserName(this._serverContext));
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
                    let newItemUrl: string = WorkItemTrackingService.GetNewWorkItemUrl(self._serverContext.TeamProjectUrl, selectedType.label, taskTitle, self.getUserName(self._serverContext));
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

                    window.showQuickPick(self.getMyWorkItems(self._serverContext.TeamProject, query.wiql), { matchOnDescription: true, placeHolder: Strings.ChooseWorkItem }).then(
                        function (workItem) {
                            if (workItem) {
                                let url: string = undefined;
                                if (workItem.id === undefined) {
                                    self.ReportEvent(TelemetryEvents.OpenAdditionalQueryResults);
                                    url = WorkItemTrackingService.GetMyQueryResultsUrl(self._serverContext.TeamProjectUrl, query.label);
                                } else {
                                    self.ReportEvent(TelemetryEvents.ViewWorkItem);
                                    url = WorkItemTrackingService.GetEditWorkItemUrl(self._serverContext.TeamProjectUrl, workItem.id);
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

    //Returns a Q.Promise containing an array of SimpleWorkItems that are "My" work items
    public ShowMyWorkItems(): void {
        let self = this;
        this.ReportEvent(TelemetryEvents.ViewMyWorkItems);

        Logger.LogInfo("Getting work items...");
        window.showQuickPick(self.getMyWorkItems(this._serverContext.TeamProject, WitQueries.MyWorkItems), { matchOnDescription: true, placeHolder: Strings.ChooseWorkItem }).then(
            function (workItem) {
                if (workItem) {
                    let url: string = undefined;
                    if (workItem.id === undefined) {
                        self.ReportEvent(TelemetryEvents.OpenAdditionalQueryResults);
                        url = WorkItemTrackingService.GetWorkItemsBaseUrl(self._serverContext.TeamProjectUrl);
                    } else {
                        self.ReportEvent(TelemetryEvents.ViewWorkItem);
                        url = WorkItemTrackingService.GetEditWorkItemUrl(self._serverContext.TeamProjectUrl, workItem.id);
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

    private getMyWorkItemQueries(): Q.Promise<Array<WorkItemQueryQuickPickItem>> {
        let queries: Array<WorkItemQueryQuickPickItem> = [];
        let promiseToReturn: Q.Promise<Array<WorkItemQueryQuickPickItem>>;
        let deferred = Q.defer<Array<WorkItemQueryQuickPickItem>>();
        promiseToReturn = deferred.promise;

        let svc: WorkItemTrackingService = new WorkItemTrackingService(this._serverContext);
        Logger.LogInfo("Getting my work item queries...");
        Logger.LogInfo("TP: " + this._serverContext.TeamProject);
        svc.GetWorkItemHierarchyItems(this._serverContext.TeamProject).then((hierarchyItems) => {
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
        Logger.LogInfo("TP: " + this._serverContext.TeamProject);
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
        svc.GetWorkItemTypes(this._serverContext.TeamProject).then((types) => {
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

    private handleError(reason: any, infoMessage?: string) : void {
        let offline: boolean = Utils.IsOffline(reason);
        let msg: string = Utils.GetMessageForStatusCode(reason, reason.message);
        let logPrefix: string = (infoMessage === undefined) ? "" : infoMessage + " ";

        if (offline === true) {
            Logger.LogError(logPrefix + msg);
        } else {
            this.ReportError(logPrefix + msg);
        }
        VsCodeUtils.ShowErrorMessage(msg);
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
}

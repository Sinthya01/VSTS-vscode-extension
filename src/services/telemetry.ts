/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { Settings } from "../helpers/settings";
import { TeamServerContext } from "../contexts/servercontext";

import appInsights = require("applicationinsights");
import uuid = require("node-uuid");

var os = require("os");

export class TelemetryService {
    private _appInsightsClient: Client;
    private _serverContext: TeamServerContext;
    private _extensionVersion: string = "1.98.0";
    private _collectionId: string = "UNKNOWN";
    //Default to a new uuid in case the extension fails before being initialized
    private _userId: string = uuid.v1();
    private _sessionId: string = uuid.v4();
    private _productionKey: string = "44267cbb-b9ba-4bce-a37a-338588aa4da3";

    constructor(context: TeamServerContext, settings: Settings) {
        this._serverContext = context;

        let insightsKey = this._productionKey;
        if (settings.AppInsightsKey !== undefined) {
            insightsKey = settings.AppInsightsKey;
        }

        appInsights.setup(insightsKey)
                    .setAutoCollectConsole(false)
                    .setAutoCollectPerformance(false)
                    .setAutoCollectRequests(settings.AppInsightsEnabled)
                    .start();
        this._appInsightsClient = appInsights.getClient(insightsKey);

        //Assign common properties to all telemetry sent from the default client
        this.setCommonProperties();
    }

    public SendEvent(event: string, properties?: any): void {
        if (this._appInsightsClient !== undefined) {
            this._appInsightsClient.trackEvent(event, properties);
        }
    }

    public SendException(message: string, properties?: any): void {
        if (this._appInsightsClient !== undefined) {
            this._appInsightsClient.trackException(new Error(message), properties);
        }
    }

    public SendMetric(metric: string, duration: number): void {
        if (this._appInsightsClient !== undefined) {
            this._appInsightsClient.trackMetric(metric, duration);
        }
    }

    //Updates the collectionId and userId originally set when constructed.  We need the telemetry
    //service before we actually have collectionId and userId.  Due to fallback when vsts/info api
    //is missing, collectionId could be undefined.
    public Update(collectionId: string, userId: string) {
        if (collectionId !== undefined) {
            this._collectionId = collectionId;
        }
        if (userId !== undefined) {
            this._userId = userId;
            //If we change the userId, we also want to associate a new sessionId
            this._sessionId = uuid.v4();
        }
        this.setCommonProperties();
    }

    private setCommonProperties(): void {
        this._appInsightsClient.commonProperties = {
            "VSTS.TeamFoundationServer.IsHostedServer" : this._serverContext.IsTeamServices.toString(),
            "VSTS.TeamFoundationServer.ServerId" : this._serverContext.Host,
            "VSTS.TeamFoundationServer.CollectionId": this._collectionId,
            "VSTS.Core.Machine.OS.Platform" : os.platform(),
            "VSTS.Core.Machine.OS.Type" : os.type(),
            "VSTS.Core.Machine.OS.Release" : os.release(),
            "VSTS.Core.User.Id" : this._userId,
            "Plugin.Version" : this._extensionVersion
        };

        //Set the userid on the AI context so that we can get user counts in the telemetry
        let aiUserId = this._appInsightsClient.context.keys.userId;
        this._appInsightsClient.context.tags[aiUserId] = this._userId;

        let aiSessionId = this._appInsightsClient.context.keys.sessionId;
        this._appInsightsClient.context.tags[aiSessionId] = this._sessionId;
    }
}

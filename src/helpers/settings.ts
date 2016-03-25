/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { workspace } from "vscode";
import { SettingNames } from "./constants";
import { Logger } from "../helpers/logger";

export class Settings {
    private _appInsightsEnabled: boolean;
    private _appInsightsKey: string;
    private _loggingLevel: string;
    private _pollingInterval: number;
    private _teamServicesPersonalAccessToken: string;

    constructor(account: string) {
        let loggingLevel = SettingNames.LoggingLevel;
        this._loggingLevel = this.readSetting<string>(loggingLevel, undefined);

        // Storing PATs by account in the configuration settings to make switching between accounts easier
        this._teamServicesPersonalAccessToken = this.getAccessToken(account);

        let pollingInterval = SettingNames.PollingInterval;
        this._pollingInterval = this.readSetting<number>(pollingInterval, 5);
        Logger.LogDebug("Polling interval value (minutes): " + this._pollingInterval.toString());
        // Ensure a minimum value when an invalid value is set
        if (this._pollingInterval <= 0) {
            Logger.LogDebug("Negative polling interval provided.  Setting to default.");
            this._pollingInterval = 5;
        }

        this._appInsightsEnabled = this.readSetting<boolean>(SettingNames.AppInsightsEnabled, true);
        this._appInsightsKey = this.readSetting<string>(SettingNames.AppInsightsKey, undefined);
    }

    private getAccessToken(account: string) : string {
        let tokens: any = this.readSetting<Array<any>>(SettingNames.AccessTokens, undefined);
        if (tokens !== undefined) {
            Logger.LogDebug("Found access tokens in user configuration settings.");
            let global: string = undefined;
            for (var index = 0; index < tokens.length; index++) {
                let element: any = tokens[index];
                if (element.account === account) {
                    return element.token;
                } else if (element.account === "global") {
                    global = element.token;
                }
            }
            if (global !== undefined) {
                Logger.LogDebug("No account-specific token found, using global token.");
                return global;
            }
        }
        Logger.LogDebug("No account-specific token or global token found.");
        return undefined;
    }

    private readSetting<T>(name: string, defaultValue:T): T {
        let configuration = workspace.getConfiguration();
        let value = configuration.get<T>(name, undefined);

        // If user specified a value, use it
        if (value !== undefined && value !== null) {
            return value;
        }
        return defaultValue;
    }

    public get AppInsightsEnabled(): boolean {
        return this._appInsightsEnabled;
    }

    public get AppInsightsKey(): string {
        return this._appInsightsKey;
    }

    public get LoggingLevel(): string {
        return this._loggingLevel;
    }

    public get PollingInterval(): number {
        return this._pollingInterval;
    }

    public get TeamServicesPersonalAccessToken() : string {
        return this._teamServicesPersonalAccessToken;
    }
}

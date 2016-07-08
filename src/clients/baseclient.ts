/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { Logger } from "../helpers/logger";
import { TelemetryService } from "../services/telemetry";

export class BaseClient {
    private _telemetryService: TelemetryService;

    constructor(telemetryService: TelemetryService) {
        this._telemetryService = telemetryService;
    }

    //Logs an error to the logger and sends an exception to telemetry service
    public ReportError(message: string, properties?: any): void {
        Logger.LogError(message);
        this._telemetryService.SendException(message, properties);
    }

    public ReportEvent(event: string, properties?: any): void {
        this._telemetryService.SendEvent(event, properties);
    }

    //SendFeedback doesn't honor the AppInsights enabled flag
    public ReportFeedback(event: string, properties?: any): void {
        this._telemetryService.SendFeedback(event, properties);
    }
}

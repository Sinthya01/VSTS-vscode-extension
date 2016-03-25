/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import basem = require("vso-node-api/ClientApiBases");
import VsoBaseInterfaces = require("vso-node-api/interfaces/common/VsoBaseInterfaces");
import Q = require("q");

import { window } from "vscode";
import { BaseClient } from "./baseclient";
import { TeamServerContext} from "../contexts/servercontext";
import { TelemetryEvents } from "../helpers/constants";
import { Strings } from "../helpers/strings";
import { Utils } from "../helpers/utils";
import { BaseQuickPickItem } from "../helpers/vscode";
import { TelemetryService } from "../services/telemetry";

// This class is not exported since we want to enforce the use of the Q-based class
class TeamServicesApi extends basem.ClientApiBase {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[]) {
        super(baseUrl, handlers, "node-vsts-vscode-api");
    }

    getVstsInfo(onResult: (err: any, statusCode: number, obj: any) => void): void {
        this.restClient.getJson(this.vsoClient.resolveUrl("/vsts/info"), "", null, null, onResult);
    }
}

export class QTeamServicesApi extends basem.QClientApiBase {
    api: TeamServicesApi;

    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[]) {
        super(baseUrl, handlers, TeamServicesApi);
    }

    public getVstsInfo(): Q.Promise<any> {
        let defer: Q.Deferred<{}> = Q.defer();

        this.api.getVstsInfo((err: any, statusCode: number, obj: any) => {
            if (err) {
                err.statusCode = statusCode;
                defer.reject(err);
            } else {
                defer.resolve(obj);
            }
        });

        return defer.promise;
    }
}

export class TeamServicesClient extends BaseClient {
    private _serverContext: TeamServerContext;

    constructor(context: TeamServerContext, telemetryService: TelemetryService) {
        super(telemetryService);

        this._serverContext = context;
    }

    public SendFeedback(): void {
        let self = this;

        let choices: Array<BaseQuickPickItem> = [];
        choices.push({ label: Strings.SendASmile, description: undefined, id: TelemetryEvents.SendASmile });
        choices.push({ label: Strings.SendAFrown, description: undefined, id: TelemetryEvents.SendAFrown });

        window.showQuickPick(choices, { matchOnDescription: false, placeHolder: Strings.SendFeedback }).then(
            function (choice) {
                if (choice) {
                    window.showInputBox({ value: undefined, prompt: Strings.SendFeedbackPrompt, placeHolder: undefined, password: false }).then((value) => {
                        if (value === undefined) {
                            let disposable = window.setStatusBarMessage(Strings.NoFeedbackSent);
                            setInterval(() => disposable.dispose(), 1000 * 5);
                            return;
                        }

                        //User does not need to provide any feedback text
                        let providedEmail: string = "";
                        window.showInputBox({ value: undefined, prompt: Strings.SendEmailPrompt, placeHolder: undefined, password: false }).then((email) => {
                            if (email === undefined) {
                                let disposable = window.setStatusBarMessage(Strings.NoFeedbackSent);
                                setInterval(() => disposable.dispose(), 1000 * 5);
                                return;
                            }
                            if (email) {
                                providedEmail = email;
                            }
                            self.ReportEvent(choice.id, { "VSCode.Feedback.Comment" : value, "VSCode.Feedback.Email" : providedEmail} );

                            let disposable = window.setStatusBarMessage(Strings.ThanksForFeedback);
                            setInterval(() => disposable.dispose(), 1000 * 5);
                        });
                    });
                }
            },
            function (err) {
                self.ReportError(Utils.GetMessageForStatusCode(0, err.message, "Failed getting SendFeedback selection"));
            }
        );
    }
}

/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { Disposable, OutputChannel, window } from "vscode";
import { Tfvc } from "./tfvc";

export class TfvcOutput {
    private static outputChannel: OutputChannel;

    public static async CreateChannel(tfvc: Tfvc, version: string, disposables?: Disposable[]): Promise<void> {
        if (TfvcOutput.outputChannel !== undefined) {
            return;
        }

        TfvcOutput.outputChannel = window.createOutputChannel("TFVC");
        TfvcOutput.outputChannel.appendLine("Using TFVC command line: " + tfvc.Location + " (" + version + ")");
        tfvc.onOutput(line => TfvcOutput.outputChannel.append(line), null, disposables);

        disposables.push(TfvcOutput.outputChannel);
    }
}

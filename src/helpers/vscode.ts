/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { QuickPickItem, Range, window } from "vscode";
import { Constants } from "./constants";

export class BaseQuickPickItem implements QuickPickItem {
    label: string;
    description: string;
    id: string;
}

export class WorkItemQueryQuickPickItem extends BaseQuickPickItem {
    wiql: string;
}

export class VsCodeUtils {

    //Returns the trimmed value if there's an activeTextEditor and a selection
    public static GetActiveSelection(): string {
        let editor = window.activeTextEditor;
        if (!editor) {
            return undefined;
        }

        // Make sure that the selection is not empty and it is a single line
        let selection = editor.selection;
        if (selection.isEmpty || !selection.isSingleLine) {
            return undefined;
        }

        let range = new Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
        let value = editor.document.getText(range).trim();

        return value;
    }

    public static ShowErrorMessage(message: string) {
        window.showErrorMessage("(" + Constants.ExtensionName + ") " + message);
    }

    public static ShowWarningMessage(message: string) {
        window.showWarningMessage("(" + Constants.ExtensionName + ") " + message);
    }
}

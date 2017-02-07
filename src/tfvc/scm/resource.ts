/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { SCMResource, SCMResourceDecorations, Uri } from "vscode";
import { Status } from "./status";
import { DecorationProvider } from "./decorationprovider";

export class Resource implements SCMResource {
    private _uri: Uri;
    private _type: Status;

    get uri(): Uri { return this._uri; }
    get type(): Status { return this._type; }
    get decorations(): SCMResourceDecorations {
        // TODO Add conflict type to the resource constructor and pass it here
        return DecorationProvider.getDecorations(this._type);
    }

    constructor(uri: Uri, type: Status) {
        this._uri = uri;
        this._type = type;
    }
}

/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { SCMResourceGroup } from "vscode";
import { Resource } from "./resource";

export class ResourceGroup implements SCMResourceGroup {
    get id(): string { return this._id; }
    get label(): string { return this._label; }
    get resources(): Resource[] { return this._resources; }

    constructor(private _id: string, private _label: string, private _resources: Resource[]) {
    }
}

export class MergeGroup extends ResourceGroup {
    static readonly ID = "merge";

    constructor(resources: Resource[]) {
        //TODO localize
        super(MergeGroup.ID, "Merge Changes", resources);
    }
}

export class IndexGroup extends ResourceGroup {

    static readonly ID = "included";

    constructor(resources: Resource[]) {
        //TODO localize
        super(IndexGroup.ID, "Included Changes", resources);
    }
}

export class WorkingTreeGroup extends ResourceGroup {

    static readonly ID = "excluded";

    constructor(resources: Resource[]) {
        //TODO localize
        super(WorkingTreeGroup.ID, "Excluded Changes", resources);
    }
}

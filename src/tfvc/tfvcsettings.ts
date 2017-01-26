/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { BaseSettings } from "../helpers/settings";

export class TfvcSettings extends BaseSettings {
    private _location: string;

    constructor() {
        super();

        this._location = this.readSetting<string>(SettingNames.Location, undefined);
    }

    public get Location(): string {
        return this._location;
    }
}

class SettingNames {
    public static get Location(): string { return "tfvc.location"; }
}

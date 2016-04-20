/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { CredentialInfo } from "../../src/info/credentialinfo";
import { BasicCredentialHandler } from "vso-node-api/handlers/basiccreds";

var chai = require("chai");
/* tslint:disable:no-unused-variable */
var expect = chai.expect;
/* tslint:enable:no-unused-variable */
var assert = chai.assert;
chai.should();

describe("CredentialInfo", function() {

    it("should ensure PAT returns a BasicCredentialHandler", function() {
        let credentialInfo: CredentialInfo = new CredentialInfo("pat-token");
        let basic: BasicCredentialHandler = <BasicCredentialHandler>(credentialInfo.CredentialHandler);
        assert.isDefined(basic);
    });

    it("should ensure username + password is currently undefined", function() {
        let credentialInfo: CredentialInfo = new CredentialInfo("username", "password");
        assert.isDefined(credentialInfo);
        assert.isUndefined(credentialInfo.CredentialHandler);
        let basic: BasicCredentialHandler = <BasicCredentialHandler>(credentialInfo.CredentialHandler);
        assert.isUndefined(basic);
    });

});

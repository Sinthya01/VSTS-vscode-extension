/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { TeamServerContext } from "../../src/contexts/servercontext";

var chai = require("chai");
/* tslint:disable:no-unused-variable */
var expect = chai.expect;
/* tslint:enable:no-unused-variable */
var assert = chai.assert;
chai.should();

describe("TeamServerContext", function() {

    it("should verify thrown Error for undefined remoteUrl", function() {
        try {
            new TeamServerContext(undefined);
        } catch (error) {
            assert.equal(error.message, "remoteUrl is undefined");
        }
    });

    it("should verify context is not a TeamFoundation context", function() {
        // We expect "/_git/" in the repository Url
        let context: TeamServerContext = new TeamServerContext("https://account.visualstudio.com/DefaultCollection/teamproject/");
        assert.isFalse(context.RepoInfo.IsTeamServices);
        assert.isFalse(context.RepoInfo.IsTeamFoundation);
        assert.isFalse(context.RepoInfo.IsTeamFoundationServer);
    });

});

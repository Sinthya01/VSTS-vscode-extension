/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { TeamServerContext } from "../../src/contexts/servercontext";
import { BasicCredentialHandler } from "vso-node-api/handlers/basiccreds";

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

    it("should verify host, account and isTeamServices for valid remoteUrl", function() {
        let context: TeamServerContext = new TeamServerContext("https://account.visualstudio.com/DefaultCollection/teamproject/");
        assert.equal(context.Host, "account.visualstudio.com");
        assert.equal(context.Account, "account");
        assert.isTrue(context.IsTeamServices);
    });

    it("should verify valid values in repositoryInfo to UpdateValues method", function() {
        let context: TeamServerContext = new TeamServerContext("https://account.visualstudio.com/DefaultCollection/teamproject/");
        assert.equal(context.Host, "account.visualstudio.com");
        assert.equal(context.Account, "account");
        assert.isTrue(context.IsTeamServices);
        let repositoryInfo = {
           "serverUrl": "https://account.visualstudio.com",
           "collection": {
              "id": "5e082e28-e8b2-4314-9200-629619e91098",
              "name": "account",
              "url": "https://account.visualstudio.com/_apis/projectCollections/5e082e28-e8b2-4314-9200-629619e91098"
           },
           "repository": {
              "id": "cc015c05-de20-4e3f-b3bc-3662b6bc0e42",
              "name": "teamproject",
              "url": "https://account.visualstudio.com/DefaultCollection/_apis/git/repositories/cc015c05-de20-4e3f-b3bc-3662b6bc0e42",
              "project": {
                 "id": "ecbf2301-0e62-4b0d-a12d-1992f2ea95a8",
                 "name": "teamproject",
                 "description": "Our team project",
                 "url": "https://account.visualstudio.com/DefaultCollection/_apis/projects/ecbf2301-0e62-4b0d-a12d-1992f2ea95a8",
                 "state": 1,
                 "revision": 14558
              },
              "remoteUrl": "https://account.visualstudio.com/teamproject/_git/teamproject"
           }
        };
        context.UpdateValues(repositoryInfo);
        assert.equal(context.Host, "account.visualstudio.com");
        assert.equal(context.Account, "account");
        assert.equal(context.AccountUrl, "https://account.visualstudio.com");
        assert.equal(context.CollectionId, "5e082e28-e8b2-4314-9200-629619e91098");
        assert.equal(context.CollectionName, "account");
        assert.equal(context.CollectionUrl, "https://account.visualstudio.com");
        assert.isTrue(context.IsTeamServices);
        assert.equal(context.RepositoryId, "cc015c05-de20-4e3f-b3bc-3662b6bc0e42");
        assert.equal(context.RepositoryName, "teamproject");
        assert.equal(context.RepositoryUrl, "https://account.visualstudio.com/teamproject/_git/teamproject");
        assert.equal(context.TeamProject, "teamproject");
        assert.equal(context.TeamProjectUrl, "https://account.visualstudio.com/teamproject");
    });

    it("should persist proper pat in credential handler", function() {
        let context: TeamServerContext = new TeamServerContext("https://account.visualstudio.com/DefaultCollection/teamproject/");
        context.SetCredentialHandler("pat-token");
        let handler: BasicCredentialHandler = context.CredentialHandler;
        assert.equal(handler.username, "OAuth");
        assert.equal(handler.password, "pat-token");
    });

});

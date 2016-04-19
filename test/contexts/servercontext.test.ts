/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { TeamServerContext } from "../../src/contexts/servercontext";
import { RepositoryInfo } from "../../src/info/repositoryinfo";

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

    it("should verify host, account and isTeamFoundationServer for valid remoteUrl", function() {
        let context: TeamServerContext = new TeamServerContext("http://jeyou-dev00000:8080/tfs/DefaultCollection/_git/GitAgile");
        assert.equal(context.RepoInfo.Host, "jeyou-dev00000:8080");  //TODO: Should host on-prem contain the port number?
        assert.equal(context.RepoInfo.Account, "jeyou-dev00000:8080");  //TODO: Should account on-prem contain the port number?
        assert.isTrue(context.RepoInfo.IsTeamFoundation);
        assert.isTrue(context.RepoInfo.IsTeamFoundationServer);
        assert.isFalse(context.RepoInfo.IsTeamServices);

        // For on-prem currently, these should not be set
        assert.equal(context.RepoInfo.CollectionId, undefined);
        assert.equal(context.RepoInfo.CollectionName, undefined);
        assert.equal(context.RepoInfo.CollectionUrl, undefined);
        assert.equal(context.RepoInfo.RepositoryId, undefined);
        assert.equal(context.RepoInfo.RepositoryName, undefined);
        assert.equal(context.RepoInfo.RepositoryUrl, undefined);
        assert.equal(context.RepoInfo.TeamProject, undefined);
        assert.equal(context.RepoInfo.TeamProjectUrl, undefined);
    });

    it("should verify host, account and isTeamServices for valid remoteUrl", function() {
        let context: TeamServerContext = new TeamServerContext("https://account.visualstudio.com/DefaultCollection/teamproject/_git/repositoryName");
        assert.equal(context.RepoInfo.Host, "account.visualstudio.com");
        assert.equal(context.RepoInfo.Account, "account");
        assert.isTrue(context.RepoInfo.IsTeamServices);
        assert.isTrue(context.RepoInfo.IsTeamFoundation);
    });

    it("should verify valid values in repositoryInfo to RepositoryInfo constructor", function() {
        let context: TeamServerContext = new TeamServerContext("https://account.visualstudio.com/DefaultCollection/teamproject/_git/repositoryName");
        assert.equal(context.RepoInfo.Host, "account.visualstudio.com");
        assert.equal(context.RepoInfo.Account, "account");
        assert.isTrue(context.RepoInfo.IsTeamServices);
        assert.isTrue(context.RepoInfo.IsTeamFoundation);
        let repositoryInfo = {
           "serverUrl": "https://account.visualstudio.com",
           "collection": {
              "id": "5e082e28-e8b2-4314-9200-629619e91098",
              "name": "account",
              "url": "https://account.visualstudio.com/_apis/projectCollections/5e082e28-e8b2-4314-9200-629619e91098"
           },
           "repository": {
              "id": "cc015c05-de20-4e3f-b3bc-3662b6bc0e42",
              "name": "repositoryName",
              "url": "https://account.visualstudio.com/DefaultCollection/_apis/git/repositories/cc015c05-de20-4e3f-b3bc-3662b6bc0e42",
              "project": {
                 "id": "ecbf2301-0e62-4b0d-a12d-1992f2ea95a8",
                 "name": "teamproject",
                 "description": "Our team project",
                 "url": "https://account.visualstudio.com/DefaultCollection/_apis/projects/ecbf2301-0e62-4b0d-a12d-1992f2ea95a8",
                 "state": 1,
                 "revision": 14558
              },
              "remoteUrl": "https://account.visualstudio.com/teamproject/_git/repositoryName"
           }
        };
        context.RepoInfo = new RepositoryInfo(repositoryInfo);
        assert.equal(context.RepoInfo.Host, "account.visualstudio.com");
        assert.equal(context.RepoInfo.Account, "account");
        assert.equal(context.RepoInfo.AccountUrl, "https://account.visualstudio.com");
        assert.equal(context.RepoInfo.CollectionId, "5e082e28-e8b2-4314-9200-629619e91098");
        assert.equal(context.RepoInfo.CollectionName, "account");
        assert.equal(context.RepoInfo.CollectionUrl, "https://account.visualstudio.com");
        assert.isTrue(context.RepoInfo.IsTeamServices);
        assert.isTrue(context.RepoInfo.IsTeamFoundation);
        assert.isFalse(context.RepoInfo.IsTeamFoundationServer);
        assert.equal(context.RepoInfo.RepositoryId, "cc015c05-de20-4e3f-b3bc-3662b6bc0e42");
        assert.equal(context.RepoInfo.RepositoryName, "repositoryName");
        assert.equal(context.RepoInfo.RepositoryUrl, "https://account.visualstudio.com/teamproject/_git/repositoryName");
        assert.equal(context.RepoInfo.TeamProject, "teamproject");
        assert.equal(context.RepoInfo.TeamProjectUrl, "https://account.visualstudio.com/teamproject");
    });

});

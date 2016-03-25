/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { Build, BuildBadge, BuildQueryOrder, DefinitionReference, QueryDeletedOption } from "vso-node-api/interfaces/BuildInterfaces";
import { IQBuildApi } from "vso-node-api/BuildApi";
import { WebApi } from "vso-node-api/WebApi";
import { TeamServerContext } from "../contexts/servercontext";

import Q = require("q");

export class BuildService {
    private _buildApi: IQBuildApi;

    constructor(context: TeamServerContext) {
        this._buildApi = new WebApi(context.CollectionUrl, context.CredentialHandler).getQBuildApi();
    }

    //Returns the build definitions (regardless of type) for the team project
    public GetBuildDefinitions(teamProject: string): Q.Promise<DefinitionReference[]> {
        return this._buildApi.getDefinitions(teamProject);
    }

    //Returns the "latest"" build for this definition
    public GetBuildsByDefinitionId(teamProject: string, definitionId: number): Q.Promise<Array<Build>> {
        return this._buildApi.getBuilds(teamProject, [ definitionId ], null, null, null, null, null, null, null, null, null, null, null,
                                        1, null, 1, QueryDeletedOption.ExcludeDeleted, BuildQueryOrder.FinishTimeDescending);
    }

    //Get extra details of a build based on the build id
    public GetBuildById(buildId: number): Q.Promise<Build> {
        return this._buildApi.getBuild(buildId);
    };

    //Construct the url to the individual build definition (completed view)
    //https://account.visualstudio.com/DefaultCollection/project/_build#_a=completed&definitionId=34
    public static GetBuildDefinitionUrl(remoteUrl: string, definitionId: string) : string {
        return BuildService.GetBuildsUrl(remoteUrl) + "#_a=completed" + "&definitionId=" + definitionId;
    }

    //Construct the url to the individual build summary
    //https://account.visualstudio.com/DefaultCollection/project/_build#_a=summary&buildId=1977
    public static GetBuildSummaryUrl(remoteUrl: string, buildId: string) : string {
        return BuildService.GetBuildsUrl(remoteUrl) + "#_a=summary" + "&buildId=" + buildId;
    }

    //Construct the url to the build definitions page for the project
    public static GetBuildDefinitionsUrl(remoteUrl: string) : string {
        return BuildService.GetBuildsUrl(remoteUrl) + "/definitions";
    }

    //Construct the url to the builds page for the project
    public static GetBuildsUrl(remoteUrl: string) : string {
        return remoteUrl + "/_build";
    }

    //Get the latest build id and badge of a build definition based on current project, repo and branch
    public GetBuildBadge(project: string, repoType: string, repoId: string, branchName: string) : Q.Promise<BuildBadge> {
        return this._buildApi.getBuildBadge(project, repoType, repoId, branchName);
    }
}

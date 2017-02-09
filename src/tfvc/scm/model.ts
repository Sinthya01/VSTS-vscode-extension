/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { Uri, EventEmitter, Event, SCMResourceGroup, Disposable, window } from "vscode";
import { Repository } from "../repository";
import { filterEvent } from "../util";
import { Resource } from "./resource";
import { ResourceGroup, IncludedGroup, ExcludedGroup, MergeGroup } from "./resourcegroups";
import { IPendingChange } from "../interfaces";
import { Status } from "./status";

export class Model {
    private _disposables: Disposable[] = [];
    private _repositoryRoot: string;
    private _repository: Repository;

    private _onDidChange = new EventEmitter<SCMResourceGroup[]>();
    public get onDidChange(): Event<SCMResourceGroup[]> {
        return this._onDidChange.event;
    }

    private _mergeGroup = new MergeGroup([]);
    private _includedGroup = new IncludedGroup([]);
    private _excludedGroup = new ExcludedGroup([]);

    public constructor(repositoryRoot: string, repository: Repository, onWorkspaceChange: Event<Uri>) {
        this._repositoryRoot = repositoryRoot;
        this._repository = repository;
        const onNonGitChange = filterEvent(onWorkspaceChange, uri => !/\/\.tf\//.test(uri.fsPath));
        onNonGitChange(this.onFileSystemChange, this, this._disposables);
        this.status();
    }

    public get MergeGroup(): MergeGroup { return this._mergeGroup; }
    public get IndexGroup(): IncludedGroup { return this._includedGroup; }
    public get WorkingTreeGroup(): ExcludedGroup { return this._excludedGroup; }

    public get Resources(): ResourceGroup[] {
        const result: ResourceGroup[] = [];
        if (this._mergeGroup.resources.length > 0) {
            result.push(this._mergeGroup);
        }
        if (this._includedGroup.resources.length > 0) {
            result.push(this._includedGroup);
        }
        result.push(this._excludedGroup);
        return result;
    }

    private async status(): Promise<void> {
        await this.run(undefined);
    }

    private onFileSystemChange(uri: Uri): void {
        this.status();
    }

    private async run(fn: () => Promise<void>): Promise<void> {
        return window.withScmProgress(async () => {
            if (fn) {
                await fn();
            } else {
                Promise.resolve();
            }
            await this.update();
        });
    }

    private async update(): Promise<void> {
        const changes: IPendingChange[] = await this._repository.GetStatus();
        const included: Resource[] = [];
        const excluded: Resource[] = [];
        const merge: Resource[] = [];

        changes.forEach(raw => {
            const resource: Resource = new Resource(raw);

            if (resource.HasStatus(Status.MERGE)) {
                return merge.push(resource);
            } else {
                return included.push(resource);
            }
        });

        this._mergeGroup = new MergeGroup(merge);
        this._includedGroup = new IncludedGroup(included);
        this._excludedGroup = new ExcludedGroup(excluded);

        this._onDidChange.fire(this.Resources);
    }
}

/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

/* tslint:disable */

import { Uri, EventEmitter, Event, SCMResourceGroup, Disposable, window } from "vscode";
import { Repository } from "../repository";
import { filterEvent } from "../util";
import { Resource } from "./resource";
import { Operation } from "./operations";
import { ResourceGroup, IndexGroup, WorkingTreeGroup, MergeGroup } from "./resourcegroups";
import { IPendingChange } from "../interfaces";
import { Status } from "./status";

export class Model {
    private _disposables: Disposable[] = [];
    private _repositoryRoot: string;
    private _repository: Repository;
    private _statusInProgress: boolean;

    private _onDidChange = new EventEmitter<SCMResourceGroup[]>();
    readonly onDidChange: Event<SCMResourceGroup[]> = this._onDidChange.event;

    private _mergeGroup = new MergeGroup([]);
    get mergeGroup(): MergeGroup { return this._mergeGroup; }

    private _indexGroup = new IndexGroup([]);
    get indexGroup(): IndexGroup { return this._indexGroup; }

    private _workingTreeGroup = new WorkingTreeGroup([]);
    get workingTreeGroup(): WorkingTreeGroup { return this._workingTreeGroup; }

    get resources(): ResourceGroup[] {
        const result: ResourceGroup[] = [];
        if (this._mergeGroup.resources.length > 0) {
            result.push(this._mergeGroup);
        }
        if (this._indexGroup.resources.length > 0) {
            result.push(this._indexGroup);
        }
        result.push(this._workingTreeGroup);
        return result;
    }

    constructor(repositoryRoot: string, repository: Repository, onWorkspaceChange: Event<Uri>) {
        this._repositoryRoot = repositoryRoot;
        this._repository = repository;
        const onNonGitChange = filterEvent(onWorkspaceChange, uri => !/\/\.tf\//.test(uri.fsPath));
        onNonGitChange(this.onFileSystemChange, this, this._disposables);
        this.status();
    }

    get repositoryRoot(): string {
        return this._repositoryRoot;
    }

    async status(): Promise<void> {
        await this.run(Operation.Status);
    }

    private onFileSystemChange(uri: Uri): void {
        this.status();
    }

    private async run(operation: Operation, fn: () => Promise<void> = () => Promise.resolve()): Promise<void> {
        return window.withScmProgress(async () => {
            //this._operations = this._operations.start(operation);
            //this._onRunOperation.fire(operation);

            try {
                await fn();
                await this.update();
            } finally {
                //this._operations = this._operations.end(operation);
                //this._onDidRunOperation.fire(operation);
            }
        });
    }

    //@throttle
    private async update(): Promise<void> {
        const changes: IPendingChange[] = await this._repository.GetStatus();
        const index: Resource[] = [];
        const workingTree: Resource[] = [];
        const merge: Resource[] = [];

        changes.forEach(raw => {
            const uri = Uri.file(raw.localItem);

            switch (raw.changeType.toLowerCase()) {
                case "add": return workingTree.push(new Resource(uri, Status.ADD));
                case "branch": return workingTree.push(new Resource(uri, Status.BRANCH));
                case "delete": return workingTree.push(new Resource(uri, Status.DELETE));
                case "edit": return workingTree.push(new Resource(uri, Status.EDIT));
                case "lock": return workingTree.push(new Resource(uri, Status.LOCK));
                case "merge": return merge.push(new Resource(uri, Status.MERGE));
                case "rename": return workingTree.push(new Resource(uri, Status.RENAME));
                case "undelete": return workingTree.push(new Resource(uri, Status.UNDELETE));
            }
        });

        this._mergeGroup = new MergeGroup(merge);
        this._indexGroup = new IndexGroup(index);
        this._workingTreeGroup = new WorkingTreeGroup(workingTree);

        this._onDidChange.fire(this.resources);
    }

/*
    private onFSChange(uri: Uri): void {
        const config = workspace.getConfiguration("git");
        const autorefresh = config.get<boolean>("autorefresh");

        if (!autorefresh) {
            return;
        }

        if (!this.operations.isIdle()) {
            return;
        }

        this.eventuallyUpdateWhenIdleAndWait();
    }

    //@debounce(1000)
    private eventuallyUpdateWhenIdleAndWait(): void {
        this.updateWhenIdleAndWait();
    }

    //@throttle
    private async updateWhenIdleAndWait(): Promise<void> {
        await this.whenIdle();
        await this.status();
        await new Promise(c => setTimeout(c, 5000));
    }

    private async whenIdle(): Promise<void> {
        while (!this.operations.isIdle()) {
            await eventToPromise(this.onDidRunOperation);
        }
    }
*/

}
    /* tslint:enable */

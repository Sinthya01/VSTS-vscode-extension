/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

"use strict";

import { workspace, Uri, Disposable, Event, EventEmitter } from "vscode";
import { TfvcSCMProvider } from "../tfvcscmprovider";
import { Repository } from "../repository";

export class TfvcContentProvider {

    private _tfvcRepository: Repository;
    private _rootPath: string;
    private disposables: Disposable[] = [];

    private onDidChangeEmitter = new EventEmitter<Uri>();
    get onDidChange(): Event<Uri> { return this.onDidChangeEmitter.event; }

    private uris = new Set<Uri>();

    constructor(repository: Repository, rootPath: string, onTfvcChange: Event<Uri>) {
        this._tfvcRepository = repository;
        this._rootPath = rootPath;
        this.disposables.push(
            onTfvcChange(this.fireChangeEvents, this),
            workspace.registerTextDocumentContentProvider(TfvcSCMProvider.scmScheme, this)
        );
    }

    private fireChangeEvents(): void {
        //TODO need to understand why these events are needed and how the list of uris should be purged
        //     Currently firing these events creates an infinite loop
        //for (let uri of this.uris) {
        //    this.onDidChangeEmitter.fire(uri);
        //}
    }

    async provideTextDocumentContent(uri: Uri): Promise<string> {
        let path: string = uri.fsPath;
        const versionSpec: string = uri.query;

        if (versionSpec.toLowerCase() === "c0") {
            // Changeset 0 does not exist. This is most likely an Add, so just return empty contents
            return "";
        }

        // If path is a server path, we need to fix the format
        if (path && path.startsWith("\\$\\")) {
            // convert "/$/proj/folder/file" to "$/proj/folder/file";
            path = uri.path.slice(1);
        }

        try {
            const contents: string = await this._tfvcRepository.GetFileContent(path, versionSpec);
            this.uris.add(uri);
            return contents;
        } catch (err) {
            this.uris.delete(uri);
            return "";
        }
    }

    dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}

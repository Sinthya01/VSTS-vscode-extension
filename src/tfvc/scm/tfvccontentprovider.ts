/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

"use strict";

import { workspace, Uri, Disposable, Event, EventEmitter } from "vscode";
import { TfvcSCMProvider } from "../tfvcscmprovider";
import { Tfvc } from "../tfvc";
//import * as path from "path";

export class TfvcContentProvider {

    private _tfvc: Tfvc;
    private _rootPath: string;
    private disposables: Disposable[] = [];

    private onDidChangeEmitter = new EventEmitter<Uri>();
    get onDidChange(): Event<Uri> { return this.onDidChangeEmitter.event; }

    private uris = new Set<Uri>();

    constructor(tfvc: Tfvc, rootPath: string, onTfvcChange: Event<Uri>) {
        this._tfvc = tfvc;
        this._rootPath = rootPath;
        this.disposables.push(
            onTfvcChange(this.fireChangeEvents, this),
            workspace.registerTextDocumentContentProvider(TfvcSCMProvider.scmScheme, this)
        );
    }

    private fireChangeEvents(): void {
        for (let uri of this.uris) {
            this.onDidChangeEmitter.fire(uri);
        }
    }

    async provideTextDocumentContent(uri: Uri): Promise<string> {
        //const treeish = uri.query;
        //const relativePath = path.relative(this.rootPath, uri.fsPath).replace(/\\/g, "/");

        try {
            //TODO call download command
            // Should we exec the command directly? seems like we should push this logic into tfvc or repository
            // Should we have a reference to the repository object here instead of the tfvc?
            const result = { exitCode: 1, stdout: "" }; //await this.git.exec(this.rootPath, ["show", `${treeish}:${relativePath}`]);

            if (result.exitCode !== 0) {
                this.uris.delete(uri);
                return "";
            }

            this.uris.add(uri);
            return result.stdout;
        } catch (err) {
            this.uris.delete(uri);
            return "";
        }
    }

    dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}

/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { commands, scm, Uri, Disposable, SCMProvider, SCMResourceGroup, Event, ProviderResult, workspace } from "vscode";
import { Model } from "./scm/model";
import { Status } from "./scm/status";
import { Resource } from "./scm/resource";
import { ResourceGroup } from "./scm/resourcegroups";
import { TfvcContext } from "../contexts/tfvccontext";
import { anyEvent, filterEvent } from "./util";
import { ExtensionManager } from "../extensionmanager";
import { RepositoryType } from "../contexts/repositorycontext";
import { TfvcOutput } from "./tfvcoutput";
import { TfvcContentProvider } from "./scm/tfvccontentprovider";

import * as path from "path";

/**
 * This class provides the SCM implementation for TFVC.
 * Note: to switch SCM providers you must do the following:
 *      F1 -> SCM: Enable SCM Preview
 *      F1 -> SCM: Switch SCM Provider -> Choose TFVC from the pick list
 */
export class TfvcSCMProvider implements SCMProvider {
    public static scmScheme: string = "tfvc";

    private _extensionManager: ExtensionManager;
    private _repoContext: TfvcContext;
    private _model: Model;
    private _disposables: Disposable[] = [];

    constructor(extensionManager: ExtensionManager) {
        this._extensionManager = extensionManager;
    }

    public async Initialize(disposables: Disposable[]): Promise<void> {
        const rootPath = workspace.rootPath;
        if (!rootPath) {
            // no root means no need for an scm provider
            return;
        }

        // Check if this is a TFVC repository
        if (!this._extensionManager.RepoContext
            || this._extensionManager.RepoContext.Type !== RepositoryType.TFVC
            || this._extensionManager.RepoContext.IsTeamFoundation === false) {
            // We don't have a TFVC context, so don't load the provider
            return;
        }

        this._repoContext = <TfvcContext>this._extensionManager.RepoContext;
        const fsWatcher = workspace.createFileSystemWatcher("**");
        const onWorkspaceChange = anyEvent(fsWatcher.onDidChange, fsWatcher.onDidCreate, fsWatcher.onDidDelete);
        const onTfvcChange = filterEvent(onWorkspaceChange, uri => /^\$tf\//.test(workspace.asRelativePath(uri)));
        this._model = new Model(this._repoContext.RepoFolder, this._repoContext.TfvcRepository, onWorkspaceChange);

        let version: string = "unknown";
        try {
            version = await this._repoContext.TfvcRepository.CheckVersion();
        } catch (err) {
            this._extensionManager.DisplayWarningMessage(err.message);
        }
        TfvcOutput.CreateChannel(this._repoContext.Tfvc, version, disposables);

        //const commitHandler = new CommitController(model);
        const contentProvider = new TfvcContentProvider(this._repoContext.TfvcRepository, rootPath, onTfvcChange);
        //const checkoutStatusBar = new CheckoutStatusBar(model);
        //const syncStatusBar = new SyncStatusBar(model);
        //const autoFetcher = new AutoFetcher(model);
        //const mergeDecorator = new MergeDecorator(model);

        // Now that everything is setup, we can register the provider
        scm.registerSCMProvider(TfvcSCMProvider.scmScheme, this);

        disposables.push(
            //commitHandler,
            this,
            contentProvider,
            fsWatcher
            //checkoutStatusBar,
            //syncStatusBar,
            //autoFetcher,
            //mergeDecorator
        );

    }

    /* Implement SCMProvider interface */

    get resources(): SCMResourceGroup[] { return this._model.resources; }
    get onDidChange(): Event<SCMResourceGroup[]> { return this._model.onDidChange; }
    get label(): string { return "TFVC"; }
    get count(): number {
        const countBadge = workspace.getConfiguration("tfvc").get<string>("countBadge");

        switch (countBadge) {
            case "off": return 0;
            case "tracked": return this._model.indexGroup.resources.length;
            default: return this._model.resources.reduce((r, g) => r + g.resources.length, 0);
        }
    }

    /**
     * This is the default action when an resource is clicked in the viewlet.
     * For ADD, AND UNDELETE just show the local file.
     * For DELETE just show the server file.
     * For EDIT AND RENAME show the diff window (server on left, local on right).
     */
    open(resource: Resource): ProviderResult<void> {
        const left: Uri = this.getLeftResource(resource);
        const right: Uri = this.getRightResource(resource);
        const title: string = this.getTitle(resource);

        if (!left) {
            if (!right) {
                // TODO
                console.error("oh no");
                return;
            }

            return commands.executeCommand<void>("vscode.open", right);
        }

        return commands.executeCommand<void>("vscode.diff", left, right, title);
    }

    drag(resource: Resource, resourceGroup: ResourceGroup): void {
        console.log("drag", resource, resourceGroup);
    }

    getOriginalResource(uri: Uri): Uri | undefined {
        if (uri.scheme !== "file") {
            return;
        }

        return uri.with({ scheme: TfvcSCMProvider.scmScheme });
    }

    dispose(): void {
        this._disposables.forEach(d => d.dispose());
        this._disposables = [];
    }

    /**
     * Gets the uri for the previous version of the file.
     */
    private getLeftResource(resource: Resource): Uri {
        switch (resource.Type) {
            case Status.EDIT:
            case Status.RENAME:
                return resource.GetServerUri();
            default:
                return undefined;
        }
    }

    /**
     * Gets the uri for the current version of the file (except for deleted files).
     */
    private getRightResource(resource: Resource): Uri {
        switch (resource.Type) {
            case Status.DELETE:
                return resource.GetServerUri();
            default:
                return resource.uri;
        }
    }

    private getTitle(resource: Resource): string {
        const basename = path.basename(resource.PendingChange.localItem);
        const sourceBasename = resource.PendingChange.sourceItem ? path.basename(resource.PendingChange.sourceItem) : "";

        switch (resource.Type) {
            case Status.EDIT:
                return `${basename}`;
            case Status.RENAME:
                return sourceBasename ? `${basename} <- ${sourceBasename}` : `${basename}`;
        }

        return "";
    }
}

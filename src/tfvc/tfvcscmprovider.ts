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
import { anyEvent /*, filterEvent */ } from "./util";
import { ExtensionManager } from "../extensionmanager";
import { TfvcOutput } from "./tfvcoutput";
//import { TfvcContentProvider } from "./scm/tfvccontentprovider";

import * as path from "path";

/**
 * This class provides the SCM implementation for TFVC.
 * Note: to switch SCM providers you must do the following:
 *      F1 -> SCM: Enable SCM Preview
 *      F1 -> SCM: Switch SCM Provider -> Choose TFVC from the pick list
 */
export class TfvcSCMProvider implements SCMProvider {
    public static scmScheme: string = "tfvc";

    private _repositoryContext: TfvcContext;
    private _extensionManager: ExtensionManager;
    private model: Model;
    private disposables: Disposable[] = [];

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
        const repoContext: TfvcContext = new TfvcContext(rootPath);
        await repoContext.Initialize(undefined);
        if (!repoContext || repoContext.IsTeamFoundation === false) {
            // We don't have a TFVC repository so we don't need to register this scm provider
            return;
        }

        this._repositoryContext = repoContext;
        const fsWatcher = workspace.createFileSystemWatcher("**");
        const onWorkspaceChange = anyEvent(fsWatcher.onDidChange, fsWatcher.onDidCreate, fsWatcher.onDidDelete);
        //const onTfvcChange = filterEvent(onWorkspaceChange, uri => /^\.tf\//.test(workspace.asRelativePath(uri)));
        this.model = new Model(repoContext.RepoFolder, repoContext.TfvcRepository, onWorkspaceChange);

        let version: string = "unknown";
        try {
            version = await repoContext.TfvcRepository.CheckVersion();
        } catch (err) {
            this._extensionManager.DisplayWarningMessage(err.message);
        }
        TfvcOutput.CreateChannel(repoContext.Tfvc, version, disposables);

        //const commitHandler = new CommitController(model);
        //const contentProvider = new TfvcContentProvider(repoContext.Tfvc, rootPath, onTfvcChange);
        //const checkoutStatusBar = new CheckoutStatusBar(model);
        //const syncStatusBar = new SyncStatusBar(model);
        //const autoFetcher = new AutoFetcher(model);
        //const mergeDecorator = new MergeDecorator(model);

        // Now that everything is setup, we can register the provider
        scm.registerSCMProvider(TfvcSCMProvider.scmScheme, this);

        disposables.push(
            //commitHandler,
            this,
            //contentProvider,
            fsWatcher
            //checkoutStatusBar,
            //syncStatusBar,
            //autoFetcher,
            //mergeDecorator
        );

    }

    /* Implement SCMProvider interface */

    get resources(): SCMResourceGroup[] { return this.model.resources; }
    get onDidChange(): Event<SCMResourceGroup[]> { return this.model.onDidChange; }
    get label(): string { return "TFVC"; }
    get count(): number {
        const countBadge = workspace.getConfiguration("tfvc").get<string>("countBadge");

        switch (countBadge) {
            case "off": return 0;
            case "tracked": return this.model.indexGroup.resources.length;
            default: return this.model.resources.reduce((r, g) => r + g.resources.length, 0);
        }
    }

    open(resource: Resource): ProviderResult<void> {
        const left = this.getLeftResource(resource);
        const right = this.getRightResource(resource);
        const title = this.getTitle(resource);

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
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
    }

    /**
     * Gets the uri for the server version of the file.
     */
    private getLeftResource(resource: Resource): Uri | undefined {
        switch (resource.type) {
            case Status.EDIT:
            case Status.RENAME:
                return resource.uri.with({ scheme: TfvcSCMProvider.scmScheme, query: "HEAD" });

            case Status.EDIT:
                const uriString = resource.uri.toString();
                const [indexStatus] = this.model.indexGroup.resources.filter(r => r.uri.toString() === uriString);

                if (indexStatus) {
                    return resource.uri.with({ scheme: TfvcSCMProvider.scmScheme });
                }

                return resource.uri.with({ scheme: TfvcSCMProvider.scmScheme, query: "HEAD" });
        }
    }

    /**
     * Gets the uri for the local version of the file.
     */
    private getRightResource(resource: Resource): Uri | undefined {
        switch (resource.type) {
            case Status.EDIT:
            case Status.ADD:
            case Status.RENAME:
                return resource.uri.with({ scheme: TfvcSCMProvider.scmScheme });

            case Status.DELETE:
                return resource.uri.with({ scheme: TfvcSCMProvider.scmScheme, query: "HEAD" });

            default:
                return resource.uri;
        }
    }

    private getTitle(resource: Resource): string {
        const basename = path.basename(resource.uri.fsPath);

        switch (resource.type) {
            case Status.EDIT:
            case Status.RENAME:
                return `${basename}`;
        }

        return "";
    }
}

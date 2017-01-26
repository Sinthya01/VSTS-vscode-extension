/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

/**
 * Create an instance of this class to build up the arguments that should be passed to the command line.
 */
export class ArgumentBuilder {
    private _arguments: string[] = [];
    private _secretArgumentIndexes: number[] = [];

    public constructor(command: string) {
        this.Add(command);
        this.AddSwitch("noprompt");
        //TODO set context params: login, proxy, collection
        /*
        if (context != null && context.getCollectionURI() != null) {
            final String collectionURI = context.getCollectionURI().toString();
            // decode URI since CLC does not expect encoded collection urls
            try {
                builder.addSwitch("collection", URLDecoder.decode(collectionURI, "UTF-8"));
            } catch (UnsupportedEncodingException e) {
                logger.warn("Error while decoding collection url. Using encoded url instead", e);
                builder.addSwitch("collection", collectionURI);
            }
            if (context.getAuthenticationInfo() != null) {
                builder.addSwitch("login", context.getAuthenticationInfo().getUserName() + "," + context.getAuthenticationInfo().getPassword(), true);
            }
            if (useProxyIfAvailable) {
                final String proxyURI = WorkspaceHelper.getProxyServer(collectionURI);
                if (StringUtils.isNotEmpty(proxyURI)) {
                    builder.addSwitch("proxy", proxyURI);
                }
            }
        }
        */
    }

    public Add(arg: string): ArgumentBuilder {
        this._arguments.push(arg);
        return this;
    }

    public AddSecret(arg: string): ArgumentBuilder {
        this.Add(arg);
        this._secretArgumentIndexes.push(this._arguments.length - 1);
        return this;
    }

    public AddSwitch(switchName: string): ArgumentBuilder {
        return this.AddSwitchWithValue(switchName, null, false);
    }

    public AddSwitchWithValue(switchName: string, switchValue: string, isSecret: boolean): ArgumentBuilder {
        let arg: string;
        if (!switchValue) {
            arg = "-" + switchName;
        } else {
            arg = "-" + switchName + ":" + switchValue;
        }

        if (isSecret) {
            this.AddSecret(arg);
        } else {
            this.Add(arg);
        }

        return this;
    }

    public Build(): string[] {
        return this._arguments;
    }

    public ToString(): string {
        let output: string = "";
        for (let i = 0; i < this._arguments.length; i++) {
            let arg: string = this._arguments[i];
            if (this._secretArgumentIndexes.indexOf(i) >= 0) {
                // This arg is a secret so hide the value
                arg = "********";
            }
            output += arg + " ";
        }
        return output.trim();
    }
}

/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

/**
 * Create an instance of this class to build up the arguments that should be passed to the command line.
 */
export class ArgumentBuilder {
    private arguments: string[] = [];
    private secretArgumentIndexes: number[] = [];

    public constructor(command: string) {
        this.add(command);
        this.addSwitch("noprompt");
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

    public add(arg: string): ArgumentBuilder {
        this.arguments.push(arg);
        return this;
    }

    public addSecret(arg: string): ArgumentBuilder {
        this.add(arg);
        this.secretArgumentIndexes.push(this.arguments.length - 1);
        return this;
    }

    public addSwitch(switchName: string): ArgumentBuilder {
        return this.addSwitchWithValue(switchName, null, false);
    }

    public addSwitchWithValue(switchName: string, switchValue: string, isSecret: boolean): ArgumentBuilder {
        let arg: string;
        if (!switchValue) {
            arg = "-" + switchName;
        } else {
            arg = "-" + switchName + ":" + switchValue;
        }

        if (isSecret) {
            this.addSecret(arg);
        } else {
            this.add(arg);
        }

        return this;
    }

    public build(): string[] {
        return this.arguments;
    }

    public toString(): string {
        let output: string = "";
        for (let i = 0; i < this.arguments.length; i++) {
            let arg: string = this.arguments[i];
            if (this.secretArgumentIndexes.indexOf(i) >= 0) {
                // This arg is a secret so hide the value
                arg = "********";
            }
            output += arg + " ";
        }
        return output.trim();
    }
}

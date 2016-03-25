/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { BuildResult } from "vso-node-api/interfaces/BuildInterfaces";
import { Strings } from "./strings";

var fs = require("fs");
var path = require("path");
var open = require("open");
var opener = require("opener");

export class Utils {

    public static FindGitFolder(startingPath: string): string {
        if (!fs.existsSync(startingPath)) { return null; }

        let gitPath: string;
        let lastPath: string;
        let currentPath: string = startingPath;

        if (!currentPath) { currentPath = process.cwd(); }

        do {
            gitPath = path.join(currentPath, ".git");

            if (fs.existsSync(gitPath)) {
              return gitPath;
            }

            lastPath = currentPath;
            currentPath = path.resolve(currentPath, "..");
        } while (lastPath !== currentPath);

        return null;
    }

    //Returns the icon string to use for a particular BuildResult
    public static GetBuildResultIcon(result: BuildResult) : string {
        switch (result) {
            case BuildResult.Succeeded:
                return "octicon-check";
            case BuildResult.Canceled:
                return "octicon-alert";
            case BuildResult.Failed:
                return "octicon-stop";
            case BuildResult.PartiallySucceeded:
                return "octicon-alert";
            case BuildResult.None:
                return "octicon-question";
            default:
                return "octicon-question";
        }
    }

    //Returns a particular message for a particular reason.  Otherwise, returns the optional prefix + message
    public static GetMessageForStatusCode(reason: any, message?: string, prefix?: string) {
        let msg: string = undefined;
        if (prefix === undefined) {
            msg = "";
        } else {
            msg = prefix + " ";
        }

        let statusCode: string = "0";
        if (reason.statusCode !== undefined) {
            statusCode = reason.statusCode.toString();
        } else if (reason.code !== undefined) {
            statusCode = reason.code;
        }

        switch (statusCode) {
            case "401":
                msg = msg + Strings.StatusCode401;
                break;
            case "ENOENT":
            case "ENOTFOUND":
            case "EAI_AGAIN":
                msg = msg + Strings.StatusCodeOffline;
                break;
            default:
                return message;
        }

        return msg;
    }

    //Use some comment error codes to indicate offline status
    public static IsOffline(reason: any): boolean {
        if (reason !== undefined) {
            if (reason.code === "ENOENT" || reason.code === "ENOTFOUND" || reason.code === "EAI_AGAIN") {
                return true;
            }
        }
        return false;
    }

    //Use open for Windows and Mac, opener for Linux
    public static OpenUrl(url: string) : void {
        switch (process.platform) {
            case "win32":
            case "darwin":
                open(url);
                break;
            default:
                opener(url);
                break;
        }
    }
}

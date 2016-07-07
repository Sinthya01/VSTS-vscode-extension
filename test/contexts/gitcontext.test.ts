/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { GitContext }  from "../../src/contexts/gitcontext";

var chai = require("chai");
/* tslint:disable:no-unused-variable */
var expect = chai.expect;
/* tslint:enable:no-unused-variable */
var assert = chai.assert;
chai.should();

describe("GitContext", function() {

    beforeEach(function() {
        console.log("__dirname: " + __dirname); //c:\VSCode.Extension\out\test
    });

    it("should verify all undefined properties for undefined GitContext path", function() {
        //Verify an undefined path does not set any values
        let gc: GitContext = new GitContext(undefined);

        assert.equal(gc.CurrentBranch, undefined);
        assert.equal(gc.RemoteUrl, undefined);
        assert.equal(gc.RepositoryParentFolder, undefined);
    });

    it("should verify undefined values for invalid GitContext path", function() {
        //Actually pass a value to constructor (instead of undefined), values should be undefined
        let gc: GitContext = new GitContext(__dirname + "invalid");

        assert.equal(gc.CurrentBranch, undefined);
        assert.equal(gc.RemoteUrl, undefined);
        assert.equal(gc.RepositoryParentFolder, undefined);
    });

    // Ideally I add more tests here but, as the GitContext object is written, would need
    // several local repositories to do so.  Mocking might be an option worth investigating.
});

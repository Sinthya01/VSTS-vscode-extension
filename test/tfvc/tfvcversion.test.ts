/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { assert } from "chai";

import { TfvcVersion }  from "../../src/tfvc/tfvcversion";

describe("Tfvc-Version", function() {
    beforeEach(function() {
        //
    });

    it("should verify constructor", function() {
        let version: TfvcVersion = new TfvcVersion(12, 11, 10, "");
        assert.equal(version.ToString(), "12.11.10");
    });

    it("should verify constructor - with build", function() {
        let version: TfvcVersion = new TfvcVersion(12, 11, 10, "buildpart");
        assert.equal(version.ToString(), "12.11.10.buildpart");
    });

    it("should verify constructor - with dotted build", function() {
        let version: TfvcVersion = new TfvcVersion(12, 11, 10, "build.part.");
        assert.equal(version.ToString(), "12.11.10.build.part.");
    });

    it("should verify FromString", function() {
        let version: TfvcVersion = TfvcVersion.FromString("12.11.10.build.part.");
        assert.equal(version.ToString(), "12.11.10.build.part.");
    });

    it("should verify FromString - missing build", function() {
        let version: TfvcVersion = TfvcVersion.FromString("12.11.10");
        assert.equal(version.ToString(), "12.11.10");
    });

    it("should verify FromString - missing revision", function() {
        let version: TfvcVersion = TfvcVersion.FromString("12.11");
        assert.equal(version.ToString(), "12.11.0");
    });

    it("should verify Compare", function() {
        let version1: TfvcVersion = TfvcVersion.FromString("12.11");
        let version2: TfvcVersion = TfvcVersion.FromString("12.11.10");
        assert.isTrue(TfvcVersion.Compare(version1, version2) < 0);
        assert.isTrue(TfvcVersion.Compare(version2, version1) > 0);
    });

    it("should verify Compare - equals", function() {
        let version1: TfvcVersion = TfvcVersion.FromString("12.11.10");
        let version2: TfvcVersion = TfvcVersion.FromString("12.11.10");
        assert.isTrue(TfvcVersion.Compare(version1, version2) === 0);
        assert.isTrue(TfvcVersion.Compare(version2, version1) === 0);
    });

});

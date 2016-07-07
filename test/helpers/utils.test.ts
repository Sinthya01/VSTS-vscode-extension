/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { Utils }  from "../../src/helpers/utils";
import { Strings }  from "../../src/helpers/strings";

var chai = require("chai");
/* tslint:disable:no-unused-variable */
var expect = chai.expect;
/* tslint:enable:no-unused-variable */
var assert = chai.assert;
chai.should();

describe("Utils", function() {

    beforeEach(function() {
        //
    });

    it("should verify IsOffline", function() {
        let reason = { code: "ENOENT" };
        assert.isTrue(Utils.IsOffline(reason));
        reason = { code: "ENOTFOUND" };
        assert.isTrue(Utils.IsOffline(reason));
        reason = { code: "EAI_AGAIN" };
        assert.isTrue(Utils.IsOffline(reason));
        let reason2 = { statusCode: "ENOENT" };
        assert.isTrue(Utils.IsOffline(reason2));
        reason2 = { statusCode: "ENOTFOUND" };
        assert.isTrue(Utils.IsOffline(reason2));
        reason2 = { statusCode: "EAI_AGAIN" };
        assert.isTrue(Utils.IsOffline(reason2));
        reason = { code: "404" };
        assert.isFalse(Utils.IsOffline(reason));
    });

    it("should verify IsUnauthorized", function() {
        let reason = { code: 401 };
        assert.isTrue(Utils.IsUnauthorized(reason));
        let reason2 = { statusCode: 401 };
        assert.isTrue(Utils.IsUnauthorized(reason2));
    });

    it("should verify GetMessageForStatusCode with 401", function() {
        let reason = { code: "401" };
        let message: string = Utils.GetMessageForStatusCode(reason);
        assert.equal(message, Strings.StatusCode401);
    });

    it("should verify GetMessageForStatusCode for offline - ENOENT", function() {
        let reason = { code: "ENOENT" };
        let message: string = Utils.GetMessageForStatusCode(reason);
        assert.equal(message, Strings.StatusCodeOffline);
    });

    it("should verify GetMessageForStatusCode for offline - ENOTFOUND", function() {
        let reason = { code: "ENOTFOUND" };
        let message: string = Utils.GetMessageForStatusCode(reason);
        assert.equal(message, Strings.StatusCodeOffline);
    });

    it("should verify GetMessageForStatusCode for offline - EAI_AGAIN", function() {
        let reason = { code: "EAI_AGAIN" };
        let message: string = Utils.GetMessageForStatusCode(reason);
        assert.equal(message, Strings.StatusCodeOffline);
    });

    it("should verify GetMessageForStatusCode for 404", function() {
        let reason = { statusCode: "404" };
        let msg = "This should be the message that is returned.";

        let message: string = Utils.GetMessageForStatusCode(reason, msg);
        assert.equal(message, msg);
    });

    it("should verify GetMessageForStatusCode for 401 with prefix", function() {
        let reason = { statusCode: "401" };
        let msg = Strings.StatusCode401;
        let prefix: string = "PREFIX:";

        let message: string = Utils.GetMessageForStatusCode(reason, msg, prefix);
        assert.equal(message, prefix + " " + msg);
    });

});

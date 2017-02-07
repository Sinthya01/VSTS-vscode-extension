/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

export enum Status {
    ADD,
    RENAME,
    EDIT,
    DELETE,
    UNDELETE,
    LOCK,
    BRANCH,
    MERGE,
    UNKNOWN
/*
    INDEX_MODIFIED,
    INDEX_ADDED,
    INDEX_DELETED,
    INDEX_RENAMED,
    INDEX_COPIED,

    MODIFIED,
    DELETED,
    UNTRACKED,
    IGNORED,

    ADDED_BY_US,
    ADDED_BY_THEM,
    DELETED_BY_US,
    DELETED_BY_THEM,
    BOTH_ADDED,
    BOTH_DELETED,
    BOTH_MODIFIED
*/
}

export enum ConflictType {
    CONTENT,
    RENAME,
    DELETE,
    DELETE_TARGET,
    NAME_AND_CONTENT,
    MERGE, RESOLVED
}

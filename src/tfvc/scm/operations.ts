/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

export enum Operation {
    Status = 0o1,
    Stage = 0o2,
    Unstage = 0o4,
    Commit = 0o10,
    Clean = 0o20,
    Branch = 0o40,
    Checkout = 0o100,
    Fetch = 0o200,
    Sync = 0o400,
    Push = 0o1000
}

export interface Operations {
    isIdle(): boolean;
    isRunning(operation: Operation): boolean;
}

export class OperationsImpl implements Operations {

    constructor(private readonly operations: number = 0) {
        // noop
    }

    /* tslint:disable */
    start(operation: Operation): OperationsImpl {
        return new OperationsImpl(this.operations | operation);
    }

    end(operation: Operation): OperationsImpl {
        return new OperationsImpl(this.operations & ~operation);
    }

    isRunning(operation: Operation): boolean {
        return (this.operations & operation) !== 0;
    }

    isIdle(): boolean {
        return this.operations === 0;
    }
}
    /* tslint:enable */

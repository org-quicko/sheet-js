import { JSONValue } from "@org-quicko/core";
import "reflect-metadata";

@Reflect.metadata('name', 'column')
export class Column extends Array<JSONValue> {

    constructor(column: Array<JSONValue>) {
        super()
        this.push(...column)
    }

    getColumnHeader(): string {
        return this[0] ? this[0].toString() : ''
    }
}
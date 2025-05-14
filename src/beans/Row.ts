import { JSONArray, JSONValue } from "@org-quicko/core";
import "reflect-metadata";

@Reflect.metadata('name', 'row')
export class Row extends JSONArray {

    constructor(row: Array<JSONValue>) {
        super()
        this.push(...row)
    }

}
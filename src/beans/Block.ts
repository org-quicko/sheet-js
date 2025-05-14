import "reflect-metadata";
import { BaseObject } from "./BaseObject.js";


@Reflect.metadata("@entity", "block")
@Reflect.metadata("name", "block")
export abstract class Block extends BaseObject {

}

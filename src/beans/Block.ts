import "reflect-metadata";
import { BaseObject } from "./BaseObject";


@Reflect.metadata("@entity", "block")
@Reflect.metadata("name", "block")
export abstract class Block extends BaseObject {

}

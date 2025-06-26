import { JSONObject } from "@org-quicko/core";
import { TransformFnParams } from "class-transformer";
import { Item } from "../beans";

export const PlainToInstance =
    ({ obj }: TransformFnParams): Array<Item> | undefined => {
        
        if (!obj || !Array.isArray(obj.items)) {
            return undefined;
        }

        return obj.items.map((item: object) => {
            if (item && typeof item === 'object' && !Array.isArray(item)) {
                const entries = Object.entries(item);
                if (entries.length > 0) {
                    const [key, val] = entries[0];
                    return new Item(key, val);
                }
            }
            return null;
        }).filter((item): item is Item => item !== null);

    }



export const InstanceToPlain =
    ({ value }: TransformFnParams): Array<unknown> | undefined => value.map((item: Item) => {
        const object = new JSONObject();
        const key = item.getKey();
        const val = item.getValue();
        if (key != null) {
            object.set(key, val);
        }
        return object;
    });


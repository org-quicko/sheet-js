import { TransformFnParams } from "class-transformer";
import { Item } from "../beans/Item";

export const PlainToInstance =
    // *** TO CLASS TRANSFORMER ***
    ({ obj, options }: TransformFnParams): Array<Item> | undefined => {

        if (!obj || !Array.isArray(obj.items)) {
            return undefined;
        }

        const version = options?.version;

        // --- Behavior A: Version is specified AND less than 6 ---
        // --- Input format: Array<[string, any]> ---
        if (version != null && version < 6) {
            return obj.items
                .map((pair: unknown) => {
                    if (Array.isArray(pair) && pair.length === 2 && typeof pair[0] === 'string') {
                        return new Item(pair[0], pair[1]);
                    }
                    return null;
                })
                .filter((item): item is Item => item !== null);
        }
        // --- Behavior B: Version is NOT specified OR version >= 6 ---
        // --- Input format: Array<{ [key: string]: any }> ---
        return obj.items
            .map((item: object) => {
                if (item && typeof item === 'object' && !Array.isArray(item)) {
                    const entries = Object.entries(item);
                    if (entries.length > 0) {
                        const [key, val] = entries[0];
                        return new Item(key, val);
                    }
                }
                return null;
            })
            .filter((item): item is Item => item !== null);

    }


export const InstanceToPlain =
    // *** TO PLAIN TRANSFORMER ***
    ({ value, options }: TransformFnParams): Array<unknown> | undefined => {

        if (!Array.isArray(value)) {
            return value;
        }

        const version = options?.version;

        // --- Behavior A: Version is specified AND less than 6 ---
        // --- Output format: Array<[string, any]> ---
        if (version != null && version < 6) {
            return value.map((item: Item) =>
                [item.getKey(), item.getValue()]
            );
        }
        // --- Behavior B: Version is NOT specified OR version >= 6 ---
        // --- Output format: Array<{ [key: string]: any }> ---

        return value.map((item: Item) => {

            const plainItem: { [key: string]: unknown } = {};
            const key = item.getKey();
            if (key != null) {
                plainItem[key] = item.getValue();
            }
            return plainItem;

        });

    }
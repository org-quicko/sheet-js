import { Expose, Transform, Type } from "class-transformer";
import { IsArray } from "class-validator";
import "reflect-metadata";
import { Block } from "./Block";
import { Item } from "./Item";
import { InstanceToPlain, PlainToInstance } from "../custom-transformer/ListTransformer";

/**
 * Represents a list containing items of type `Item`.
 * This class provides methods to manipulate and interact with the list.
 */
@Reflect.metadata("@entity", "list")
@Reflect.metadata("name", "list")
export class List extends Block {

	@Type(() => Item)
	@Transform(PlainToInstance, { toClassOnly: true })
	@Transform(InstanceToPlain, { toPlainOnly: true })

	@Expose()
	@IsArray()
	private items?: Array<Item>;


	/**
	 * Retrieves all items in the list. Initializes the list if it is null.
	 * @returns An array of `Item` objects.
	 */
	getItems(): Array<Item> {
		if (this.items == null) {
			this.items = new Array<Item>();
		}

		return this.items;
	}

	/**
	 * Retrieves an item by its key.
	 * @param key - The key of the item to retrieve.
	 * @returns The `Item` with the matching key, or null if not found.
	 */
	getItem(key: string): Item | null {
		for (let i = 0; i < this.getItems().length; i += 1) {
			const item: Item = this.getItems().at(i) as Item;

			if (item && item.getKey() != null && item.getKey()!.toLowerCase() === key.toLowerCase()) {
				return item;
			}
		}

		return null;
	}

	/**
	 * Adds an item to the list.
	 * @param item - The `Item` to add.
	 */
	addItem(item: Item): void {
		this.getItems().push(item);
	}

	/**
	 * Adds items to the list.
	 * @param item - The `Item` to add.
	 */
	addItems(items: Item[]): void {
		items.forEach((item) => {
			this.getItems().push(item);
		})
	}

	/**
	 * Replaces an existing item in the list with a new item.
	 * If the item does not exist, it adds the new item to the list.
	 * @param item - The `Item` to replace or add.
	 */
	replaceItem(item: Item): void {
		const items = this.getItems();
		for (let i = 0; i < items.length; i += 1) {
			if ((items.at(i) as Item)!.getKey() === item.getKey()) {
				items[i] = item;
				return;
			}
		}
	}

	/**
	 * Removes an item from the list by its index or key.
	 * @param index - The index of the item to remove (if number).
	 * @param key - The key of the item to remove (if string).
	 */
	removeItem(index: number): void;

	removeItem(key: string): void;

	removeItem(arg: number | string): void {
		if (typeof arg === "number") {
			// Remove by index
			this.getItems().splice(arg, 1);
		} else if (typeof arg === "string") {
			// Remove by key
			this.items = this.getItems().filter(
				(item) => item.getKey()?.toLowerCase() !== arg.toLowerCase()
			);
		}
	}

	/**
	 * Retrieves the number of items in the list.
	 * @returns The number of items in the list.
	 */
	length(): number {
		return this.getItems().length;
	}
}

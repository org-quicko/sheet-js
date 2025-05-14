import { JSONValue } from "@org-quicko/core";
import "reflect-metadata";

/**
 * Represents an item with a key-value pair.
 * 
 * The class uses Reflect metadata to associate additional metadata with the class.
 * Metadata can be retrieved using the Reflect API.
 */
@Reflect.metadata('name', 'item')
export class Item {

	private key: string;

	private value: JSONValue;

	/**
	 * Constructs an Item instance.
	 * @param key - The key of the item.
	 * @param value - The value associated with the key.
	 */
	constructor(key: string, value: JSONValue) {
		this.key = key;
		this.value = value;
	}

	/**
	 * Retrieves the key of the item.
	 * @returns The key as a string.
	 */
	public getKey(): string {
		return this.key;
	}

	/**
	 * Retrieves the value of the item.
	 * @returns The value as an Object.
	 */
	public getValue(): JSONValue {
		return this.value;
	}

	/**
	 * Converts the value to a boolean.
	 * @returns The boolean representation of the value.
	 */
	public getBooleanValue(): boolean {
		return Boolean(this.value);
	}

	/**
	 * Converts the value to a number.
	 * If the conversion fails, it returns NaN instead of null.
	 * @returns The numeric representation of the value, or NaN if conversion fails.
	 */
	public getNumberValue(): number {
		const numericValue = Number(this.value);
		return Number.isNaN(numericValue) ? NaN : numericValue;
	}

	/**
	 * Converts the value to a string.
	 * @returns The string representation of the value.
	 */
	public getStringValue(): string {
		return String(this.value);
	}

	/**
	 * Compares this Item to another Item.
	 * The comparison is case-insensitive for the key and exact for the value.
	 * 
	 * @param {Item} item - The item to compare with.
	 * @returns {boolean} - True if the items are equal, false otherwise.
	 */
	public equals(item: Item): boolean {
		return this.getKey().toLowerCase() === item.getKey().toLowerCase() && this.getValue() === item.getValue();
	}
}

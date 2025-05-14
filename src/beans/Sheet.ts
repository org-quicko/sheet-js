import { Expose, Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import "reflect-metadata";
import { SheetJsonEntityType } from "../types/SheetJsonEntityType.js";
import { BaseObject } from "./BaseObject.js";
import { Block } from "./Block.js";
import { List } from "./List.js";
import { Table } from "./Table.js";

@Reflect.metadata("@entity", "sheet")
@Reflect.metadata("name", "sheet")
export class Sheet extends BaseObject {
	@Expose()
	@ValidateNested({ each: true })
	@Type(() => Block, {
		keepDiscriminatorProperty: true,
		discriminator: {
			property: "@entity",
			subTypes: [
				{
					value: Table,
					name: SheetJsonEntityType.TABLE,
				},
				{
					value: List,
					name: SheetJsonEntityType.LIST,
				}
			],
		},
	})
	blocks?: Array<Block>;

	getBlocks(): Array<Block> {
		if (this.blocks == null) {
			this.blocks = new Array<Block>;
		}
		return this.blocks;
	}

	/**
	 * Retrieves a block by its index or name.
	 * @param index The index of the block to retrieve.
	 * @returns The `Block` at the specified index.
	 */
	getBlock(index: number): Block;

	/**
	 * Retrieves a block by its index or name.
	 * @param name The name of the block to retrieve.
	 * @returns The `Block` with the specified name, or null if not found.
	 */
	getBlock(name: string): Block | null;

	/**
	 * Retrieves a block by its index or name.
	 * @param args A single argument that is either an index (number) or a name (string).
	 * @returns The `Block` object corresponding to the index or name.
	 * @throws `RangeError` if the index is out of bounds.
	 * @throws `Error` if the argument is not a number or string.
	 */
	getBlock(...args: [number] | [string]): Block | null {
		const getByIndex = (index: number): Block => {
			if (index < this.getBlocks().length) {
				return this.getBlocks().at(index) as Block;
			}
			throw new RangeError(`Index out of bounds: ${index}`);
		};

		const getByKey = (name: string): Block | null => {
			for (let i = 0; i < this.getBlocks().length; i += 1) {
				const block = this.getBlocks()[i];
				if (block && block.getName().toLowerCase() === name.toLowerCase()) {
					return block;
				}
			}
			return null;
		};

		if (args.length === 1 && typeof args[0] === "number") {
			return getByIndex(args[0]);
		} if (args.length === 1 && typeof args[0] === "string") {
			return getByKey(args[0]);
		}
		throw new Error("Get block expects a number or a string");
	}

	addBlock(block: Block) {
		this.getBlocks().push(block)
	}

	removeBlock(name: string): void {
		for (let i = 0; i < this.getBlocks().length; i += 1) {
			const block: Block | null = this.getBlock(i);

			if (block && block.getName().toLowerCase() === name.toLowerCase()) {
				this.getBlocks().splice(i, 1);

				return;
			}
		}
	}

	replaceBlock(block: Block): void {
		const blocks = this.getBlocks();
		const name = block.getName();

		for (let i = 0; i < blocks.length; i += 1) {
			if (blocks[i] && blocks[i].getName().toLowerCase() === name.toLowerCase()) {
				blocks[i] = block;
				return;
			}
		}
	}

	length(): number {
		return this.getBlocks().length;
	}
}

import { Expose, Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import "reflect-metadata";
import { WorkbookConverter } from "../converters/WorkbookConverter.js";
import { BaseObject } from "./BaseObject.js";
import { Sheet } from "./Sheet.js";

/**
 * Represents a workbook containing multiple sheets.
 * Provides methods to manipulate and retrieve sheets.
 */
@Reflect.metadata("@entity", "workbook")
@Reflect.metadata("name", "workbook")
export class Workbook extends BaseObject {

	@Expose()
	@ValidateNested({ each: true })
	@Type(() => Sheet)
	sheets?: Array<Sheet>;

	/**
	 * Retrieves all sheets in the workbook.
	 * Initializes the sheets array if it is null.
	 * @returns An array of `Sheet` objects.
	 */
	getSheets(): Array<Sheet> {
		if (this.sheets == null) {
			this.sheets = new Array<Sheet>();
		}
		return this.sheets;
	}

	/**
	 * Retrieves a sheet by its index or name.
	 * @param index The index of the sheet to retrieve.
	 * @returns The `Sheet` at the specified index.
	 */
	getSheet(index: number): Sheet;

	/**
	 * Retrieves a sheet by its index or name.
	 * @param name The name of the sheet to retrieve.
	 * @returns The `Sheet` with the specified name, or null if not found.
	 */
	getSheet(name: string): Sheet | null;

	/**
	 * Retrieves a sheet by its index or name.
	 * @param args A single argument that is either an index (number) or a name (string).
	 * @returns The `Sheet` object corresponding to the index or name.
	 * @throws `RangeError` if the index is out of bounds.
	 * @throws `Error` if the argument is not a number or string.
	 */
	getSheet(...args: [number] | [string]): Sheet | null {
		const getByIndex = (index: number): Sheet => {
			if (index < this.getSheets().length) {
				return this.getSheets().at(index) as Sheet;
			}
			throw new RangeError(`Index out of bounds: ${index}`);
		};

		const getByKey = (name: string): Sheet | null => {
			for (let i = 0; i < this.getSheets().length; i += 1) {
				const sheet = this.getSheets()[i];

				if (sheet && sheet.getName().toLowerCase() === name.toLowerCase()) {
					return sheet;
				}
			}
			return null;
		};

		if (args.length === 1 && typeof args[0] === "number") {
			return getByIndex(args[0]);
		} if (args.length === 1 && typeof args[0] === "string") {
			return getByKey(args[0]);
		}
		throw new Error("Get sheet expects a number or a string");
	}

	/**
	 * Adds a new sheet to the workbook.
	 * @param sheet The `Sheet` to add.
	 */
	addSheet(sheet: Sheet): void {
		this.getSheets().push(sheet);
	}

	/**
	 * Replaces an existing sheet in the workbook or adds it if it does not exist.
	 * @param sheet The `Sheet` to replace or add.
	 */
	replaceSheet(sheet: Sheet): void {
		const sheets = this.getSheets();
		const name = sheet.getName();

		for (let i = 0; i < sheets.length; i += 1) {
			if (sheets[i] && sheets[i].getName().toLowerCase() === name.toLowerCase()) {
				sheets[i] = sheet;
				return;
			}
		}
	}


	/**
	 * Removes a sheet from the workbook by its name.
	 * @param name The name of the sheet to remove.
	 * @throws `RangeError` if the name is not found.
	 */
	removeSheet(name: string): void {
		for (let i = 0; i < this.getSheets().length; i += 1) {
			const sheet: Sheet | null = this.getSheets()[i];

			if (sheet && sheet.getName().toLowerCase() === name.toLowerCase()) {
				this.getSheets().splice(i, 1);
				return;
			}
		}
		throw new RangeError(`Sheet with name '${name}' not found`);
	}

	/**
	 * Retrieves the number of sheets in the workbook.
	 * @returns The number of sheets.
	 */
	length(): number {
		return this.getSheets().length;
	}

	/**
	 * Creates a `Workbook` instance from an XLSX buffer.
	 * @param buffer The XLSX file buffer.
	 * @returns A `Workbook` instance.
	 */
	static fromXlsx(buffer: Buffer): Workbook {
		const converter = new WorkbookConverter();
		return converter.toWorkbook(buffer, Workbook);
	}

	/**
	 * Converts the `Workbook` instance to an XLSX file.
	 * @returns The XLSX file buffer.
	 */
	static toXlsx(workbook: Workbook) {
		const converter = new WorkbookConverter();
		return converter.toXlsx(workbook);
	}
}

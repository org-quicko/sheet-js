import { JSONArray } from "@org-quicko/core";
import { Expose } from "class-transformer";
import { IsArray } from "class-validator";
import "reflect-metadata";
import { Block } from "./Block";
import { Column } from "./Column";

/**
 * Represents a table containing a header and rows.
 * This class provides methods to manipulate and interact with the table's data.
 */
@Reflect.metadata("@entity", "table")
@Reflect.metadata("name", "table")
export class Table extends Block {
	@Expose()
	@IsArray()
	private header?: JSONArray;

	@Expose()
	@IsArray()
	private rows?: JSONArray;

	constructor() {
		super();
		this.header = new JSONArray();
		this.rows = new JSONArray();
	}

	/**
	 * Retrieves the table's header. Initializes it if null.
	 * @returns A `JSONArray` representing the header.
	 */
	getHeader(): JSONArray {
		return this.header!;
	}

	/**
	 * Sets the table's header.
	 * @param header - A `JSONArray` representing the new header.
	 */
	setHeader(header: JSONArray) {
		this.header = header;
	}

	/**
	 * Retrieves the table's rows. Initializes them if null.
	 * @returns A `JSONArray` representing the rows.
	 */
	getRows(): JSONArray {
		return this.rows!;
	}


	/**
	 * Retrieves a specific row by index.
	 * @param index - The index of the row to retrieve.
	 * @returns A `JSONArray` representing the row.
	 * @throws RangeError if the index is out of bounds.
	 */
	getRow(index: number): JSONArray {
		if (index < this.getRows().length) {
			return new JSONArray(this.getRows().at(index) as JSONArray);
		}
		throw new RangeError(`Index out of bounds: ${index}`);
	}

	/**
	 * Adds a new row to the table.
	 * @param row - A `JSONArray` representing the new row.
	 */
	addRow(row: JSONArray): void {
		this.getRows().push(row);
	}

	/**
	 * Adds a new rows to the table.
	 * @param rows - representing the new rows.
	 */
	addRows(rows: JSONArray[]): void {
		rows.forEach((row) => {
			this.getRows().push(row);
		})
	}

	/**
	 * Removes and returns the last row of the table.
	 */
	popRow(): void {
		this.getRows().pop();
	}

	/**
	 * Replaces an existing row at a specified index.
	 * @param index - The index of the row to replace.
	 * @param row - A `JSONArray` representing the new row.
	 */
	replaceRow(index: number, row: JSONArray): void {
		this.getRows().splice(index, 1, row);
	}

	/**
	 * Removes a row at a specified index.
	 * @param index - The index of the row to remove.
	 * @throws RangeError if the index is out of bounds.
	 */
	removeRow(index: number): void {
		if (index < this.getRows().length) {
			this.getRows().splice(index, 1);
			return;
		}
		throw new RangeError(`Index out of bounds: ${index}`);
	}

	/**
	 * Retrieves all columns in the table as an array of `Column` objects.
	 * Each column is constructed using the header and corresponding row data.
	 * @returns An array of `Column` objects.
	 */
	getColumns(): Array<Column> {
		const columns: Array<Column> = [];
		const header = this.getHeader();

		if (header != null && header.length > 0) {
			for (let i = 0; i < header.length; i += 1) {
				const column = new Column([]);
				column.push(header[i]);

				const rows = this.getRows();
				for (let j = 0; j < rows.length; j += 1) {
					column.push(rows.at(j) ? rows.at(j)![i] : null);
				}

				columns.push(column);
			}
		}

		return columns;
	}

	/**
	 * Retrieves the number of rows in the table.
	 * @returns The number of rows in the table.
	 */
	length(): number {
		return this.getRows().length;
	}
}

import { JSONArray, JSONObject, ConverterException, DateUtil } from "@org-quicko/core";
import { plainToInstance } from "class-transformer";
import * as XLSX from "xlsx";
import { Item } from "../beans/Item.js";
import { List } from "../beans/List.js";
import { Sheet } from "../beans/Sheet.js";
import { Table } from "../beans/Table.js";
import { Workbook } from "../beans/Workbook.js";

export class WorkbookConverter {
	/**
	 * XLSX to Workbook
	 */

	static isoFormatRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

	toWorkbook = <T extends Workbook>(fileBuffer: Buffer, Class: new () => T): T => {
		try {
			const workbook = XLSX.read(fileBuffer, { raw: true });
			const workbookJSON = new JSONObject();

			workbookJSON.set('@entity', 'workbook')
			workbookJSON.set('name', new Class().getName() ?? workbook.Props?.Title ?? 'workbook')

			for (const [sheetName, sheet] of Object.entries(workbook.Sheets)) {

				if (!workbookJSON.has('sheets')) {
					workbookJSON.set('sheets', new JSONArray([]));
				}
				workbookJSON.getArray('sheets').push(this.parseSheet(sheetName, sheet));
			}
			const workbookInstance = plainToInstance(Class, JSON.parse(JSON.stringify(workbookJSON)))
			return workbookInstance;
		} catch (error: unknown) {
			if (error instanceof ConverterException) {
				throw error;
			}
			throw new ConverterException(`Invalid Input Workbook : ${(error as Error)?.message}`);
		}
	};

	/**
	 * Workbook to XLSX
	 */
	toXlsx = (workbook: Workbook) => {
		const xlsxWorkbook = XLSX.utils.book_new();
		xlsxWorkbook.Props = {
			Title: workbook.getName()
		}
		workbook.getSheets().forEach((sheet) => {
			this.addSheetToXLSX(xlsxWorkbook, sheet as Sheet);
		});

		return xlsxWorkbook;
	};

	private parseSheet = (name: string, sheet: XLSX.WorkSheet): JSONObject => {
		try {

			const sheetObject = new JSONObject();

			sheetObject.set('@entity', 'sheet');
			sheetObject.set('name', name)

			const sheetJson: Array<JSONObject> = XLSX.utils.sheet_to_json(sheet, { raw: true, header: 1, defval: null, blankrows: true });

			let previousLine: JSONObject | null = null;
			let index = 0;
			let begin;
			let end

			// eslint-disable-next-line no-restricted-syntax
			for (const currentLine of sheetJson.values()) {

				if ((this.isEmptyLine(previousLine) && !this.isEmptyLine(currentLine)) || (previousLine == null && !this.isEmptyLine(currentLine))) {
					begin = index;
				}
				if (!this.isEmptyLine(previousLine) && this.isEmptyLine(currentLine)) {
					end = index;
				}

				if (begin != null && end != null) {

					if (!sheetObject.has('blocks'))
						sheetObject.set('blocks', new JSONArray([]));

					sheetObject.getArray('blocks').push(this.parseBlock(sheetJson, begin, end - 1))
					begin = null;
					end = null;
				}

				previousLine = currentLine;
				index += 1;
			}

			if (begin != null) {
				if (!sheetObject.has('blocks'))
					sheetObject.set('blocks', new JSONArray([]));

				sheetObject.getArray('blocks').push(this.parseBlock(sheetJson, begin, sheetJson.length - 1))
				begin = null;
				end = null;
			}

			return sheetObject;
		} catch (error) {
			if (error instanceof ConverterException) {
				throw error;
			}
			throw new ConverterException(`Invalid Input Sheet : ${(error as Error)?.message}`)
		}
	};

	private parseBlock = (sheetJson: Array<JSONObject>, begin: number, end: number) => {
		// check is line or table
		const name = sheetJson[begin][0];
		if (name.toLowerCase().endsWith("list")) {
			// Block is of type list
			return this.parseListBlock(name, sheetJson, begin, end);
		}
		// Block is of type table
		return this.parseTableBlock(name, sheetJson, begin, end);

	};

	private parseTableBlock = (name: string, sheetJson: Array<JSONObject>, begin: number, end: number): JSONObject => {
		try {

			const tableObject = new JSONObject();
			tableObject.set('@entity', 'table');
			tableObject.set('name', name)

			// eslint-disable-next-line no-param-reassign
			begin += 1;
			for (let i = begin; i <= end; i += 1) {
				const currentLine = sheetJson[i];
				if (i === begin) {
					const headers = new JSONArray([]);
					// eslint-disable-next-line no-restricted-syntax
					for (const cell of Object.values(currentLine)) {
						if (typeof cell === "string")
							headers.push(cell.trim());
					}

					tableObject.set('header', headers)
				}
				else {
					const rowObject = new JSONArray([]);
					const headerLength = typeof tableObject.getArray('header')?.length === "number" ? tableObject.getArray('header')?.length as number : 0;
					for (let j = 0; j < headerLength; j += 1) {
						const cell = Object.values(currentLine)[j];
						if (typeof cell === "string") {

							const headerValue = tableObject.getArray('header').at(j) as string;
							if (typeof headerValue === "string" && headerValue.includes('epoch')) {
								if (WorkbookConverter.isoFormatRegex.test(cell.trim())) {
									// Convert ISO date string to epoch time
									const date = new Date(cell.trim());
									rowObject.push(date.getTime());
								} else {
									// If not in ISO format, add the cell value as it is
									rowObject.push(cell);
								}
							} else {
								// eslint-disable-next-line no-nested-ternary
								rowObject.push(cell != null ? (DateUtil.isValidDate(cell.trim(), "MM/dd/yyyy") ? DateUtil.readDate(cell.trim(), "MM/dd/yyyy").getTime() : cell) : cell);
							}
						}
						else {
							rowObject.push(cell != null ? cell : null);
						}
					}

					if (!tableObject.has('rows'))
						tableObject.set('rows', new JSONArray([]));
					tableObject.getArray('rows').push(rowObject)
				}
			}
			if (begin === end) {
				tableObject.set('rows', new JSONArray([]))
			}
			return tableObject;
		} catch (error) {
			throw new ConverterException(`Invalid Input Table : ${(error as Error)?.message}`);
		}
	};

	private parseListBlock = (name: string, sheetJson: Array<JSONObject>, begin: number, end: number): JSONObject => {

		try {
			const listObject = new JSONObject();
			listObject.set('@entity', 'list')
			listObject.set('name', name)
			listObject.set('items', new JSONArray([]))
			for (let i = begin; i <= end; i += 1) {
				if (i === begin) {
					let blockName = "";

					const header: JSONObject = sheetJson[i];

					// eslint-disable-next-line no-restricted-syntax
					for (const cell of Object.values(header)) {
						blockName = blockName.concat(cell ?? "");
					}


				} else {
					const currentLine: JSONObject = sheetJson[i];

					if (currentLine[0] != null && currentLine[1] != null) {

						if (typeof currentLine[0] === "string" && currentLine[0].includes('epoch')) {
							if (WorkbookConverter.isoFormatRegex.test(currentLine[1].trim())) {
								// Convert ISO date string to epoch time
								const date = new Date(currentLine[1]);
								const epochTime = date.getTime();
								listObject.getArray('items').push(new JSONObject().set(currentLine[0], epochTime));
							}
							else {
								// If not in ISO format, add the cell value as it is
								listObject.getArray('items').push(new JSONObject().set(currentLine[0], currentLine[1]));
							}
						} else {
							listObject.getArray('items').push(new JSONObject().set(currentLine[0], currentLine[1]));
						}
					}
				}
			}

			return listObject;
		} catch (error) {
			throw new ConverterException(`Invalid Input List : ${(error as Error)?.message}`);
		}

	};

	private isEmptyLine = (line: JSONObject | null): boolean => {
		if (line != null) {
			// eslint-disable-next-line no-restricted-syntax
			for (const cell of Object.values(line)) {
				if (cell != null) return false;
			}
		}
		return true;
	};


	private addSheetToXLSX = (xlsxWorkbook: XLSX.WorkBook, sheet: Sheet) => {
		let xlsxSheet = XLSX.utils.aoa_to_sheet([[]]);
		let curr = 0;

		sheet.getBlocks().forEach((block) => {
			[xlsxSheet, curr] = block instanceof Table ? this.addTableToSheet(xlsxSheet, curr, block) : this.addListToSheet(xlsxSheet, curr, block as List);
			// 2 line gap between 2 blocks
			curr += 2;
		});

		// sheet name can't exceed 31 characters
		// get last part of the name after the last period
		let workbookSheetName = sheet.getName().split(".").reverse().at(0) ?? `sheet_${xlsxWorkbook.SheetNames.length.toString()}`;

		// trim from start to 31 characters
		workbookSheetName = workbookSheetName.substring(Math.max(0, workbookSheetName.length - 31), workbookSheetName.length);

		XLSX.utils.book_append_sheet(xlsxWorkbook, xlsxSheet, workbookSheetName);

		return xlsxWorkbook;
	};

	private addListToSheet = (sheet: XLSX.WorkSheet, startRow: number, list: List): [XLSX.WorkSheet, number] => {
		let row = startRow;

		XLSX.utils.sheet_add_aoa(sheet, [[list.getName()]], { origin: { r: row, c: 0 } });

		row += 1;
		list.getItems().forEach((data) => {
			const key = (data as Item)?.getKey() as string;
			if (typeof key === "string" && key.includes('epoch') && typeof (data as Item)?.getValue() === 'number') {
				// Convert epoch time to ISO format
				const date = DateUtil.fromMillis((data as Item)?.getValue() as number);
				const isoDate = DateUtil.printDate(date);

				XLSX.utils.sheet_add_aoa(sheet, [[(data as Item)?.getKey(), isoDate]], { origin: { r: row, c: 0 } });
			} else {
				XLSX.utils.sheet_add_aoa(sheet, [[(data as Item)?.getKey(), (data as Item)?.getValue()]], { origin: { r: row, c: 0 } });
			}
			row += 1;
		});

		return [sheet, row];
	};

	private addTableToSheet = (sheet: XLSX.WorkSheet, startRow: number, table: Table): [XLSX.WorkSheet, number] => {
		let row = startRow;
		XLSX.utils.sheet_add_aoa(sheet, [[table.getName()]], { origin: { r: row, c: 0 } });

		row += 1;
		const headers = table.getHeader() as JSONArray;

		XLSX.utils.sheet_add_aoa(sheet, [headers], { origin: { r: row, c: 0 } });
		row += 1;

		for (let i = 0; i < table.length(); i += 1) {
			const data = table.getRow(i);
			const convertedData = data.toJSON().map((value, index) => {
				const headerValue = headers[index] as string;
				if (typeof headerValue === "string" && headerValue.includes('epoch')) {
					if (typeof value === 'number') {
						// Convert epoch time to ISO formatz
						const date = DateUtil.fromMillis(value);
						return DateUtil.printDate(date, "yyyy-MM-dd'T'HH:mm:ssXXX");
					}
				}
				return value;
			});
			XLSX.utils.sheet_add_aoa(sheet, [convertedData], { origin: { r: row, c: 0 } });
			row += 1;
		}

		return [sheet, row];
	};
}

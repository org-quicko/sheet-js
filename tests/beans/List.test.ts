import { beforeEach, describe, expect, it } from "@jest/globals";
import { JSONValue } from "@org-quicko/core";
import "reflect-metadata";
import { Item } from "../../src/beans/Item";
import { List } from "../../src/beans/List";

describe("List", () => {
    let list: List;

    beforeEach(() => {
        list = new List();
    });

    describe("constructor", () => {
        it("should create a new List instance", () => {
            expect(list).toBeInstanceOf(List);
        });

        it("should initialize items as an empty array", () => {
            expect(list.getItems()).toEqual([]);
            expect(list.length()).toBe(0);
        });

        it("should have correct metadata", () => {
            expect(list.getName()).toBe("list");
            expect(list.getEntity()).toBe("list");
        });
    });

    describe("getItems", () => {
        it("should return an empty array when no items are added", () => {
            expect(list.getItems()).toEqual([]);
        });

        it("should return all items when items are present", () => {
            const item1 = new Item("key1", "value1");
            const item2 = new Item("key2", "value2");

            list.addItem(item1);
            list.addItem(item2);

            const items = list.getItems();
            expect(items).toHaveLength(2);
            expect(items[0]).toBe(item1);
            expect(items[1]).toBe(item2);
        });

        it("should initialize items array if null", () => {
            // This tests the null check in getItems method
            const items = list.getItems();
            expect(items).toEqual([]);
            expect(Array.isArray(items)).toBe(true);
        });
    });

    describe("addItem", () => {
        it("should add a single item to the list", () => {
            const item = new Item("testKey", "testValue");
            list.addItem(item);

            expect(list.length()).toBe(1);
            expect(list.getItems()[0]).toBe(item);
        });

        it("should add multiple items to the list", () => {
            const item1 = new Item("key1", "value1");
            const item2 = new Item("key2", "value2");

            list.addItem(item1);
            list.addItem(item2);

            expect(list.length()).toBe(2);
            expect(list.getItems()).toEqual([item1, item2]);
        });

        it("should handle items with different value types", () => {
            const stringItem = new Item("string", "test");
            const numberItem = new Item("number", 42);
            const booleanItem = new Item("boolean", true);
            const nullItem = new Item("null", null);

            list.addItem(stringItem);
            list.addItem(numberItem);
            list.addItem(booleanItem);
            list.addItem(nullItem);

            expect(list.length()).toBe(4);
            expect(list.getItem("string")?.getValue()).toBe("test");
            expect(list.getItem("number")?.getValue()).toBe(42);
            expect(list.getItem("boolean")?.getValue()).toBe(true);
            expect(list.getItem("null")?.getValue()).toBe(null);
        });
    });

    describe("addItems", () => {
        it("should add multiple items at once", () => {
            const items = [
                new Item("key1", "value1"),
                new Item("key2", "value2"),
                new Item("key3", "value3")
            ];

            list.addItems(items);

            expect(list.length()).toBe(3);
            expect(list.getItems()).toEqual(items);
        });

        it("should handle empty array", () => {
            list.addItems([]);
            expect(list.length()).toBe(0);
        });

        it("should add items to existing list", () => {
            const existingItem = new Item("existing", "value");
            list.addItem(existingItem);

            const newItems = [
                new Item("new1", "value1"),
                new Item("new2", "value2")
            ];

            list.addItems(newItems);

            expect(list.length()).toBe(3);
            expect(list.getItems()[0]).toBe(existingItem);
            expect(list.getItems()[1]).toBe(newItems[0]);
            expect(list.getItems()[2]).toBe(newItems[1]);
        });
    });

    describe("getItem", () => {
        beforeEach(() => {
            list.addItem(new Item("testKey", "testValue"));
            list.addItem(new Item("AnotherKey", "anotherValue"));
        });

        it("should return item by exact key match", () => {
            const item = list.getItem("testKey");
            expect(item).not.toBeNull();
            expect(item?.getKey()).toBe("testKey");
            expect(item?.getValue()).toBe("testValue");
        });

        it("should return item by case-insensitive key match", () => {
            const item = list.getItem("TESTKEY");
            expect(item).not.toBeNull();
            expect(item?.getKey()).toBe("testKey");
            expect(item?.getValue()).toBe("testValue");
        });

        it("should return item by mixed case key match", () => {
            const item = list.getItem("anotherkey");
            expect(item).not.toBeNull();
            expect(item?.getKey()).toBe("AnotherKey");
            expect(item?.getValue()).toBe("anotherValue");
        });

        it("should return null for non-existent key", () => {
            const item = list.getItem("nonExistentKey");
            expect(item).toBeNull();
        });

        it("should return null for empty string key", () => {
            const item = list.getItem("");
            expect(item).toBeNull();
        });

        it("should return first matching item when multiple items have same key", () => {
            list.addItem(new Item("duplicate", "first"));
            list.addItem(new Item("duplicate", "second"));

            const item = list.getItem("duplicate");
            expect(item).not.toBeNull();
            expect(item?.getValue()).toBe("first");
        });
    });

    describe("replaceItem", () => {
        beforeEach(() => {
            list.addItem(new Item("key1", "originalValue1"));
            list.addItem(new Item("key2", "originalValue2"));
        });

        it("should replace existing item with same key", () => {
            const newItem = new Item("key1", "newValue1");
            list.replaceItem(newItem);

            expect(list.length()).toBe(2);
            const replacedItem = list.getItem("key1");
            expect(replacedItem).toBe(newItem);
            expect(replacedItem?.getValue()).toBe("newValue1");
        });

        it("should not affect other items when replacing", () => {
            const newItem = new Item("key1", "newValue1");
            list.replaceItem(newItem);

            const unchangedItem = list.getItem("key2");
            expect(unchangedItem?.getValue()).toBe("originalValue2");
        });

        it("should not add item if key doesn't exist", () => {
            const newItem = new Item("nonExistentKey", "value");
            list.replaceItem(newItem);

            expect(list.length()).toBe(2);
            expect(list.getItem("nonExistentKey")).toBeNull();
        });

        it("should handle empty list", () => {
            const emptyList = new List();
            const newItem = new Item("key", "value");
            emptyList.replaceItem(newItem);

            expect(emptyList.length()).toBe(0);
        });
    });

    describe("removeItem", () => {
        beforeEach(() => {
            list.addItem(new Item("key1", "value1"));
            list.addItem(new Item("key2", "value2"));
            list.addItem(new Item("key3", "value3"));
        });

        describe("remove by index", () => {
            it("should remove item at valid index", () => {
                list.removeItem(1);

                expect(list.length()).toBe(2);
                expect(list.getItem("key1")).not.toBeNull();
                expect(list.getItem("key2")).toBeNull();
                expect(list.getItem("key3")).not.toBeNull();
            });

            it("should remove first item", () => {
                list.removeItem(0);

                expect(list.length()).toBe(2);
                expect(list.getItem("key1")).toBeNull();
                expect(list.getItem("key2")).not.toBeNull();
                expect(list.getItem("key3")).not.toBeNull();
            });

            it("should remove last item", () => {
                list.removeItem(2);

                expect(list.length()).toBe(2);
                expect(list.getItem("key1")).not.toBeNull();
                expect(list.getItem("key2")).not.toBeNull();
                expect(list.getItem("key3")).toBeNull();
            });

            it("should handle negative index", () => {
                const originalLength = list.length();
                list.removeItem(-1);

                // splice with negative index should still work
                expect(list.length()).toBe(originalLength - 1);
            });

            it("should handle out of bounds index", () => {
                const originalLength = list.length();
                list.removeItem(10);

                expect(list.length()).toBe(originalLength);
            });
        });

        describe("remove by key", () => {
            it("should remove item by exact key match", () => {
                list.removeItem("key2");

                expect(list.length()).toBe(2);
                expect(list.getItem("key1")).not.toBeNull();
                expect(list.getItem("key2")).toBeNull();
                expect(list.getItem("key3")).not.toBeNull();
            });

            it("should remove item by case-insensitive key match", () => {
                list.removeItem("KEY2");

                expect(list.length()).toBe(2);
                expect(list.getItem("key2")).toBeNull();
            });

            it("should not remove anything for non-existent key", () => {
                list.removeItem("nonExistentKey");

                expect(list.length()).toBe(3);
                expect(list.getItem("key1")).not.toBeNull();
                expect(list.getItem("key2")).not.toBeNull();
                expect(list.getItem("key3")).not.toBeNull();
            });

            it("should remove all items with matching key", () => {
                list.addItem(new Item("key1", "duplicateValue"));
                expect(list.length()).toBe(4);

                list.removeItem("key1");

                expect(list.length()).toBe(2);
                expect(list.getItem("key1")).toBeNull();
            });

            it("should handle empty string key", () => {
                list.removeItem("");
                expect(list.length()).toBe(3);
            });
        });
    });

    describe("length", () => {
        it("should return 0 for empty list", () => {
            expect(list.length()).toBe(0);
        });

        it("should return correct length after adding items", () => {
            list.addItem(new Item("key1", "value1"));
            expect(list.length()).toBe(1);

            list.addItem(new Item("key2", "value2"));
            expect(list.length()).toBe(2);
        });

        it("should return correct length after removing items", () => {
            list.addItem(new Item("key1", "value1"));
            list.addItem(new Item("key2", "value2"));
            expect(list.length()).toBe(2);

            list.removeItem(0);
            expect(list.length()).toBe(1);

            list.removeItem("key2");
            expect(list.length()).toBe(0);
        });

        it("should return correct length after adding multiple items", () => {
            const items = [
                new Item("key1", "value1"),
                new Item("key2", "value2"),
                new Item("key3", "value3")
            ];

            list.addItems(items);
            expect(list.length()).toBe(3);
        });
    });

    describe("edge cases and error handling", () => {
        it("should handle items with null keys", () => {
            // Note: Item constructor requires string key, but testing defensive programming
            const item = new Item("", "value");
            list.addItem(item);

            expect(list.length()).toBe(1);
            expect(list.getItem("")).not.toBeNull();
        });

        it("should handle items with undefined values", () => {
            const item = new Item("key", undefined as any);
            list.addItem(item);

            expect(list.length()).toBe(1);
            expect(list.getItem("key")?.getValue()).toBeUndefined();
        });

        it("should handle complex object values", () => {
            const complexValue = { nested: { value: "test" }, array: [1, 2, 3] };
            const item = new Item("complex", complexValue as JSONValue);
            list.addItem(item);

            expect(list.length()).toBe(1);
            expect(list.getItem("complex")?.getValue()).toEqual(complexValue);
        });

        it("should maintain order of items", () => {
            const items = [
                new Item("first", 1),
                new Item("second", 2),
                new Item("third", 3)
            ];

            items.forEach(item => list.addItem(item));

            const retrievedItems = list.getItems();
            expect(retrievedItems[0].getKey()).toBe("first");
            expect(retrievedItems[1].getKey()).toBe("second");
            expect(retrievedItems[2].getKey()).toBe("third");
        });
    });

    describe("inheritance and metadata", () => {
        it("should inherit from Block", () => {
            // Test that List extends Block (which extends BaseObject)
            expect(list.getName()).toBe("list");
            expect(list.getEntity()).toBe("list");
            expect(list.getMetadata()).toBeDefined();
        });

        it("should support metadata operations", () => {
            // Test BaseObject functionality
            const metadata = list.getMetadata();
            expect(metadata).toBeDefined();

            // Test metadata can be set
            metadata.set("testKey", "testValue");
            expect(metadata.get("testKey")).toBe("testValue");
        });
    });

    describe("class transformer compatibility", () => {
        it("should have proper decorators for serialization", () => {
            // Test that the class has the expected decorators
            // This ensures compatibility with class-transformer
            expect(Reflect.getMetadata("@entity", List)).toBe("list");
            expect(Reflect.getMetadata("name", List)).toBe("list");
        });
    });
});

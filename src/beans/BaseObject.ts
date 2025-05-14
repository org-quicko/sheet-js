import { BaseObject as CoreBaseObject, JSONObject } from '@org-quicko/core';
import { Expose, Transform } from 'class-transformer';
import 'reflect-metadata';

@Reflect.metadata('name', 'base_object')
@Reflect.metadata('@entity', 'base_object')
export abstract class BaseObject extends CoreBaseObject {

	@Expose({ name: 'name' })
	getName(): string {
		return Reflect.getMetadata('name', this.constructor);
	}

	@Expose({ name: '@entity' })
	getEntity(): string {
		return Reflect.getMetadata('@entity', this.constructor);
	}

	@Expose({ name: 'metadata' })
	@Transform(({ value }) => new JSONObject(value), { toClassOnly: true })
	private metadata!: JSONObject;


	getMetadata(): JSONObject {
		if (!this.metadata) {
			this.metadata = new JSONObject();
		}
		return this.metadata;
	}

	public setMetadata(value: JSONObject) {
		this.metadata = value;
	}
}

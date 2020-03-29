import { Identity } from './Identity';

export default class Person {
	constructor(private readonly identities: Identity[]) {}
}

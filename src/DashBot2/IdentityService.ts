import Identity from './Identity';
import IdentityProvider from './IdentityProvider';
import Person from './Person';

export default class IdentityService {
	private providers: IdentityProvider<Identity>[] = [];

	constructor(...identityProviders: IdentityProvider<Identity>[]) {
		this.providers = identityProviders;
	}

	getById(id: string) {
		const identities = this.providers
			.map(provider => provider.getById(id))
			.filter(iden => iden !== null) as Identity[];

		return new Person(identities);
	}

	getByName(name: string) {
		const identities = this.providers
			.map(provider => provider.getByName(name))
			.filter(iden => iden !== null) as Identity[];

		return new Person(identities);
	}
}

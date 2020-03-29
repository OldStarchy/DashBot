import Identity from './Identity';

export default interface IdentityProvider<TIdentity extends Identity> {
	getById(id: string): TIdentity | null;
	getByName(name: string): TIdentity | null;
}

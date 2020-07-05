export default function compareSemVer(a: string, b: string) {
	const regex = /^v?(?<major>\d+).(?<minor>\d+).(?<patch>\d+)(?<dev>@dev)?$/;

	const aMatch = regex.exec(a);
	const bMatch = regex.exec(b);

	if (!aMatch || !bMatch) return 0;

	const {
		major: aMajor,
		minor: aMinor,
		patch: aPatch,
		dev: aDev,
	} = aMatch.groups!;
	const {
		major: bMajor,
		minor: bMinor,
		patch: bPatch,
		dev: bDev,
	} = bMatch.groups!;

	const cmp = (a: string, b: string) =>
		Number.parseInt(a) - Number.parseInt(b);

	let r = cmp(aMajor, bMajor);
	if (r !== 0) return r;

	r = cmp(aMinor, bMinor);
	if (r !== 0) return r;

	r = cmp(aPatch, bPatch);
	if (r !== 0) return r;

	if (aDev === bDev) {
		return 0;
	}

	if (aDev) return 1;
	else return -1;
}

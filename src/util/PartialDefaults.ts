export type PartialDefaults<
	BaseType extends DefaultsType,
	DefaultsType extends Record<string, any>
> = Partial<Pick<BaseType, keyof DefaultsType>> &
	Omit<BaseType, keyof DefaultsType>;

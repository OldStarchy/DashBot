export default abstract class Identity {
	abstract getId(): string | undefined;
	abstract getName(): string;
	abstract getIsBot(): boolean;
}

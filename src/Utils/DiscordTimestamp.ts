export function formatDiscordTime(
	value: Date | string | number | null | undefined,
) {
	const date =
		value instanceof Date ? value : value ? new Date(value) : new Date();
	const timestamp = Math.floor(date.getTime() / 1000);

	return `<t:${timestamp}:t>`;
}

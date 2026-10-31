const STORAGE_KEY = 'sylvenarr.pendingDraftPresetId';

/**
 * Пресет, выбранный в /lobby, применяется один раз при пустом отряде в драфте.
 */
export const setPendingLobbyDraftPresetId = (presetId: string | null): void => {
	try {
		if (!presetId) {
			window.sessionStorage.removeItem(STORAGE_KEY);
			return;
		}
		window.sessionStorage.setItem(STORAGE_KEY, presetId);
	} catch {
		/* sessionStorage недоступен */
	}
};

/**
 * Читает и сразу снимает pending-пресет (чтобы Strict Mode не применил дважды).
 */
export const takePendingLobbyDraftPresetId = (): string | null => {
	try {
		const value = window.sessionStorage.getItem(STORAGE_KEY);
		if (value) {
			window.sessionStorage.removeItem(STORAGE_KEY);
		}
		return value;
	} catch {
		return null;
	}
};

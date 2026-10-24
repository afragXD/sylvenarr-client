import { PresetsLibraryPage } from '@/pages/Presets';
import { PageFrame } from '@/shared/ui/PageFrame';

/**
 * Админка: CRUD глобальных пресетов отряда.
 */
export const AdminPresetsPage = () => (
	<PageFrame
		title="Пресеты отряда"
		eyebrow="Админка"
		lead="Глобальные составы, которые игроки берут в лобби."
		width="wide"
	>
		<PresetsLibraryPage mode="admin" />
	</PageFrame>
);

export {
	fetchAuthProviders,
	fetchCurrentPlayer,
	getOAuthStartUrl,
	loginWithPassword,
	logoutPlayer,
	updateMyProfile,
	uploadMyAvatar,
} from './api/playersApi';
export type { AuthProvider, Player } from './model/types';

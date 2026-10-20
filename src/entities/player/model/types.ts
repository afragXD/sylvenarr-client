export type PlayerRole = 'player' | 'admin';

export type Player = {
	id: string;
	displayName: string;
	email: string | null;
	avatarUrl: string | null;
	role: PlayerRole;
	providers: string[];
	createdAt: string;
};

export type AuthProvider = {
	id: string;
	label: string;
};

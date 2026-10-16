export type Player = {
	id: string;
	displayName: string;
	email: string | null;
	avatarUrl: string | null;
	providers: string[];
	createdAt: string;
};

export type AuthProvider = {
	id: string;
	label: string;
};

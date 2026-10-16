import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/lobby')({
	component: LobbyLayout,
});

function LobbyLayout() {
	return <Outlet />;
}

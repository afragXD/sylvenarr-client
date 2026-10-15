import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/heroes')({
	component: HeroesLayout,
});

function HeroesLayout() {
	return <Outlet />;
}

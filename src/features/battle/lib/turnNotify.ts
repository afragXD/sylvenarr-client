import { getBattleSfxSettings } from './battleSfx';

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
	if (typeof window === 'undefined') {
		return null;
	}
	const Ctx =
		window.AudioContext ??
		(window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
	if (!Ctx) {
		return null;
	}
	if (!audioCtx) {
		audioCtx = new Ctx();
	}
	return audioCtx;
}

/**
 * Разблокирует AudioContext после жеста пользователя (autoplay policy).
 */
export function unlockTurnAudio(): void {
	const ctx = getContext();
	if (!ctx) {
		return;
	}
	if (ctx.state === 'suspended') {
		void ctx.resume().catch(() => undefined);
	}
}

/**
 * Короткий двутоновый сигнал «ваш ход».
 */
export function playYourTurnSound(): void {
	const { muted, volume } = getBattleSfxSettings();
	if (muted || volume <= 0) {
		return;
	}
	const ctx = getContext();
	if (!ctx) {
		return;
	}
	const start = () => {
		const now = ctx.currentTime;
		const gain = ctx.createGain();
		gain.gain.setValueAtTime(0.0001, now);
		gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.12 * volume), now + 0.02);
		gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
		gain.connect(ctx.destination);

		const playTone = (freq: number, offset: number, duration: number) => {
			const osc = ctx.createOscillator();
			osc.type = 'triangle';
			osc.frequency.setValueAtTime(freq, now + offset);
			osc.connect(gain);
			osc.start(now + offset);
			osc.stop(now + offset + duration);
		};

		playTone(660, 0, 0.12);
		playTone(880, 0.12, 0.14);
	};

	if (ctx.state === 'suspended') {
		void ctx
			.resume()
			.then(start)
			.catch(() => undefined);
		return;
	}
	start();
}

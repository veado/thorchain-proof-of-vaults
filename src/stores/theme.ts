import { writable } from 'svelte/store';
import * as FP from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import type { Theme } from '../types/types';
import { toReadable } from '../utils/data';

const DEFAULT_THEME: Theme = 'light';
const LS_KEY_THEME = 'tcpov-theme';

// type guard
const isTheme = (v: unknown): v is Theme => v === 'dark' || v === 'light';

// Update DOM - needed for theming
const setAttribute = (t: Theme) => {
	const htmlClass = document.querySelector('html').classList;
	t === 'dark' ? htmlClass.add('dark') : htmlClass.remove('dark');
};

const theme$$ = writable<Theme>(DEFAULT_THEME);
export const theme$ = toReadable(theme$$);

export const initTheme = () => {
	// Try to get initial value from local storage
	// or system preferences
	FP.pipe(
		localStorage.getItem(LS_KEY_THEME),
		O.fromNullable,
		O.chain(O.fromPredicate(isTheme)),
		O.alt<Theme>(() =>
			// check system preferences
			// @see https://tailwindcss.com/docs/dark-mode#supporting-system-preference-and-manual-selection
			window.matchMedia('(prefers-color-scheme: dark)').matches ? O.some('dark') : O.some('light')
		),
		O.map((t) => {
			setAttribute(t);
			theme$$.set(t);
			return true;
		})
	);
};

export const setTheme = (t: Theme) => {
	setAttribute(t);
	localStorage.setItem(LS_KEY_THEME, t);
	theme$$.set(t);
};

'use client';

import * as React from 'react';
import { useReducer } from 'react';

import Model from './model';
import Header from './header'
import TaskList from './tasklist';
import TaskEditor from './taskeditor'
import SettingEditor from './settingeditor';

// darkmode
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
	},
});

const lightTheme = createTheme({
	palette: {
		mode: 'light',
	},
});

export type DisplayMode = {
	state_filter: 'All' | 'Active' | 'Completed';
	search_filter: string | null;
	date_filter: [
		Date | null,
		Date | null,
	] | null,
	expire_filter: [
		Date | null,
		Date | null,
	] | null,
	page: number;
	edit_task: boolean | string;
	edit_setting: string | false;
};

export type DisplayModeAction = {
	action: 'set state filter',
	as: 'All' | 'Active' | 'Completed',
} | {
	action: 'set search filter',
	as: string,
} | {
	action: 'reset search filter',
} | {
	action: 'page turn to',
	page: number,
} | {
	action: 'open task editor',
	target: string | null,
} | {
	action: 'close task editor',
} | {
	action: 'open setting editor',
	sheet?: 'appearance' | 'data' | 'info',
} | {
	action: 'close setting editor',
}

const initial_display_mode: DisplayMode = {
	state_filter: 'All',
	search_filter: null,
	date_filter: null,
	expire_filter: null,
	page: 1,
	edit_task: false,
	edit_setting: false,
};

export default function App() {

	const [display_mode, switchDisplayMode]: [DisplayMode, (arg: DisplayModeAction) => void] = useReducer(switchDisplayModeReducer, initial_display_mode);

	return (
		<ThemeProvider theme={Model.getSetting('theme') === 'dark' ? darkTheme : lightTheme}>
			<CssBaseline />
			<div className="max-w-md container mx-auto min-h-[100vh] flex flex-col pt-[10vh] pb-[4em] px-[1em]">
				<div className="flex flex-col justify-center items-center sm">
					<Header display_mode={display_mode} switchDisplayMode={switchDisplayMode} />
					<TaskList display_mode={display_mode} switchDisplayMode={switchDisplayMode} />
				</div>
			</div>
			<TaskEditor display_mode={display_mode} switchDisplayMode={switchDisplayMode} />
			<SettingEditor display_mode={display_mode} switchDisplayMode={switchDisplayMode} />
			{/* <SettingEditor display_mode={display_mode} switchDisplayMode={switchDisplayMode} /> */}
		</ThemeProvider>
	);

}

function switchDisplayModeReducer(state: DisplayMode, action: DisplayModeAction) {
	let new_state: DisplayMode = { ...state };

	switch (action.action) {
		case 'set state filter':
			new_state.state_filter = action.as;
			new_state.page = 1;
			break;

		case 'set search filter':
			new_state.search_filter = action.as;
			new_state.page = 1;
			break;

		case 'reset search filter':
			new_state.search_filter = null;
			new_state.page = 1;
			break;

		case 'page turn to':
			new_state.page = action.page;
			break;

		case 'open task editor':
			new_state.edit_task = action.target ?? true;
			break;

		case 'close task editor':
			new_state.edit_task = false;
			break;

		case 'open setting editor':
			new_state.edit_setting = action.sheet ?? 'appearance';
			break;

		case 'close setting editor':
			new_state.edit_setting = false;
			break;

	}

	return new_state;
}
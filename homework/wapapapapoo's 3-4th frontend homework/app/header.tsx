'use client';

import * as React from 'react';
import { useState, useContext, useReducer, useRef, useEffect } from 'react';

import Model from './model';
import { DisplayMode, DisplayModeAction } from './app';

import AddIcon from '@mui/icons-material/Add';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';

export default function App({ display_mode, switchDisplayMode }: {
	display_mode: DisplayMode,
	switchDisplayMode: (arg: DisplayModeAction) => void,
}) {

	const [data_version, updateData]: [number, (version: number) => void] = useState(-1);

	if (data_version !== Model.getDataVersion()) updateData(Model.getDataVersion());

	useEffect(() => {
		let handle = Model.addEventListener('change', () => {
			updateData(Model.getDataVersion());
		});
		return () => {
			handle && Model.removeEventListener('change', handle);
		};
	}, []);

	const task_num = Model.getMetaData('size');
	const active_task_num = Model.getMetaData('active');

	return (
		<header className="w-full flex flex-col justify-center items-center sm">
			<h1 className="font-sans sm:text-[5em] text-[4em] text-stone-400 text-zinc-500 transition-all select-none">todos</h1>
			<Box sx={{ display: 'flex', flexWrap: 'wrap' }} className="w-full mt-[1.5em]">
				<TextField
					fullWidth label='今天干点啥？' title='筛选计划'
					variant="outlined" className="w-full"
					onBlur={e => {
						if (e.target.value === '')
							switchDisplayMode({
								action: 'reset search filter',
							});
						else
							switchDisplayMode({
								action: 'set search filter',
								as: e.target.value,
							});
					}}
				/>
			</Box>
			<Stack direction="row" spacing={0} className="w-full mt-[1em] flex flex-row flex-wrap justify-center sm:justify-start">
				<Button
					title='新计划' value="check"
					variant="outlined" className='min-w-0 max-h-[38px] p-[6px] shrink-0 mb-[1em] grow-0' style={{ minWidth: 0, padding: '6px', }}
					onClick={() => {
						switchDisplayMode({
							action: 'open task editor',
							target: null,
						});
					}}
				><AddIcon /></Button>
				<div className='grow ml-0 mb-[1em] sm:grow-0 transition-all'></div>
				<Button
					title={'已完成' + (task_num - active_task_num).toString() + '/' + task_num.toString() + '项计划'}
					variant="text" className='ml-[.5em] shrink-0 mb-[1em]' style={{ marginLeft: '.5em', marginBottom: '1em', }}
					onClick={() => {
						switchDisplayMode({
							action: 'set state filter',
							as: 'Active',
						});
					}}
				>
					{
						(active_task_num < 100) ? (active_task_num < 1 ? 'No' : active_task_num.toString()) : '99+'
					} tasks left
				</Button>
				<div className='grow-0 ml-0 mb-[1em] sm:grow transition-all'></div>
				<ToggleButtonGroup
					size="small"
					{...{
						value: display_mode.state_filter,
						onChange: (
							event: React.MouseEvent<HTMLElement>,
							new_state_filter: 'All' | 'Active' | 'Completed',
						) => {
							switchDisplayMode({
								action: 'set state filter',
								as: new_state_filter,
							});
						},
						exclusive: true,
					}}
					className='block float-right shrink-0 sm:mb-[1em] sm:me-0'
					style={{
						marginLeft: 0,
						marginBottom: '1em',
					}}
				>
					<ToggleButton value='All' key='All' title='全部计划'>
						All
					</ToggleButton>
					<ToggleButton value='Active' key='Active' title='进行中'>
						Active
					</ToggleButton>
					<ToggleButton value='Completed' key='Completed' title='完成'>
						Completed
					</ToggleButton>
				</ToggleButtonGroup>
			</Stack>
		</header>
	);

}
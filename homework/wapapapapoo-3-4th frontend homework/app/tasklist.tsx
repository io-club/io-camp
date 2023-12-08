'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';

import SettingsIcon from '@mui/icons-material/Settings';

import Model from './model';
import { Task } from './model';
import { DisplayMode, DisplayModeAction } from './app';
import TaskCard from './taskcard'

import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';

export default function TaskList({ display_mode, switchDisplayMode }: {
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

	const size = Model.getMetaData('size');

	const page_size = Model.getSetting('page_size');

	const range = [(display_mode.page - 1) * page_size, display_mode.page * page_size];

	const handleQuery = (task: Task) => {
		if (
			display_mode.state_filter !== 'All'
			&& task.stat !== display_mode.state_filter
		) return false;

		if (
			display_mode.search_filter
			&& !task.title.toLowerCase().includes(display_mode.search_filter.toLowerCase())
			&& !task.tag.includes(display_mode.search_filter)
			&& !task.desc.toLowerCase().includes(display_mode.search_filter.toLowerCase())
		) return false;

		if (
			display_mode.date_filter
			&& (
				display_mode.date_filter[0] && task.date < display_mode.date_filter[0]
				|| display_mode.date_filter[1] && task.date > display_mode.date_filter[1]
			)
		) return false;

		if (
			display_mode.expire_filter
			&& (
				display_mode.expire_filter[0] && task.expire < display_mode.expire_filter[0]
				|| display_mode.expire_filter[1] && task.expire > display_mode.expire_filter[1]
			)
		) return false;

		return true;
	}

	const data = Model.getTasks({
		range_start: range[0],
		range_end: range[1],
		query: handleQuery,
	});

	let task_list: Array<React.ReactNode> = [];
	data.tasks.forEach((task: Task, index) => {
		task_list.push(
			<TaskCard
				key={task.uuid + Math.random()}
				data={task}
				version={Model.getDataVersion()}
				display_mode={display_mode}
				switchDisplayMode={switchDisplayMode}
			/>
		);
	});

	return (
		<article className='w-full'>
			<ol className='w-full'>
				{task_list}
			</ol>
			<Stack direction="row" spacing={0}>
				<Pagination
					className='mt-[1em]'
					count={data.size % page_size ? Math.floor(data.size / page_size) + 1 : data.size / page_size}
					page={display_mode.page}
					onChange={(event: React.ChangeEvent<unknown>, value: number) => {
						switchDisplayMode({
							action: 'page turn to',
							page: value,
						});
					}}
				/>
				<div className='grow mt-[1em]'></div>
				<IconButton title='配置' size='small' onClick={() => {
					switchDisplayMode({
						action: 'open setting editor',
					});
				}} className='max-h-[32px] mt-[16px] me-[16px] p-[4px] shrink-0 grow-0'>
					<SettingsIcon />
				</IconButton>
			</Stack>
		</article>
	);

}
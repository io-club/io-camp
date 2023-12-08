'use client';

import * as React from 'react';

import Model from './model';
import { DisplayMode, DisplayModeAction } from './app';
import { Task, TagList } from './model';

import TaskAltIcon from "@mui/icons-material/TaskAlt";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import DeleteIcon from '@mui/icons-material/Delete';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';

import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Checkbox from "@mui/material/Checkbox";
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';

export default function EditTask({ display_mode, switchDisplayMode }: {
	display_mode: DisplayMode,
	switchDisplayMode: (arg: DisplayModeAction) => void,
}) {
	const avatarColor: TagList = Model.getSetting('tags');
	const tagList = Object.keys(Model.getSetting('tags'));

	const defaultData: Task = {
		uuid: 'new_task',
		date: new Date(),
		expire: new Date(Date.now() + 3 * 60 * 60 * 1000),
		stat: 'Active',
		title: 'Title...',
		tag: [],
		desc: 'Description...',
	};

	const [union_state, setUnionState]: [
		union_state: {
			data: Task | null,
			auto_complete: Task | null,
		},
		setUnionState: Function,
	] = React.useState({
		data: null,
		auto_complete: null,
	});

	const readonly_data: Task
		= union_state.data // 当前正在编辑的数据
		?? (
			typeof display_mode.edit_task === 'string' ?
				Model.getTask(display_mode.edit_task) :
				undefined
		) // 按照编辑对象预填充的数据
		?? union_state.auto_complete // 组件自动填充记录的数据
		?? defaultData; // 默认的数据

	// 临时退出编辑，当前数据保留作自动填充
	function handleClose() {
		let new_state = { ...union_state };
		new_state.auto_complete = new_state.data;
		new_state.data = null;
		setUnionState(new_state);
		switchDisplayMode({
			action: 'close task editor',
		});
	}

	// 取消编辑
	function handleCancel() {
		let new_state = { ...union_state };
		new_state.auto_complete = null;
		new_state.data = null;
		setUnionState(new_state);
		switchDisplayMode({
			action: 'close task editor',
		});
	}

	// 存储数据
	function handleSave() {
		let new_state = { ...union_state };
		new_state.auto_complete = null;
		new_state.data = null;
		setUnionState(new_state);
		switchDisplayMode({
			action: 'close task editor',
		});
		if (display_mode.edit_task && display_mode.edit_task !== true) {
			Model.editTask(display_mode.edit_task, data);
		} else {
			Model.createTask(data);
		}
	}

	// 修改数据
	function patchData(target: string, value: string | Date | Array<string>) {
		let new_state = { ...union_state };
		new_state.data = data;
		new_state.data[target] = value;
		setUnionState(new_state);
	}

	// 点击删除按钮
	function handleDelete() {
		if (Model.getSetting('ask_before_droptask') ? confirm('请确认是否删除') : true) {
			let new_state = { ...union_state };
			new_state.auto_complete = new_state.data;
			new_state.data = null;
			setUnionState(new_state);
			switchDisplayMode({
				action: 'close task editor',
			});
			Model.dropTask(data.uuid);
		}
	}

	const handleEditTagList = React.useCallback(() => {
		switchDisplayMode({
			action: 'open setting editor',
			sheet: 'appearance',
		});
	}, [switchDisplayMode]);

	// 手工深复制，十分匠人精神
	let data: Task = {
		uuid: readonly_data.uuid,
		date: new Date(readonly_data.date),
		expire: new Date(readonly_data.expire),
		stat: readonly_data.stat,
		title: readonly_data.title === '' ? '无标题' : readonly_data.title,
		tag: [...readonly_data.tag],
		desc: readonly_data.desc,
	};

	// 数据时间取整分钟
	data.date.setSeconds(0);
	data.date.setMilliseconds(0);

	return (<Dialog
		open={display_mode.edit_task ? true : false}
		onClose={handleClose}
		scroll="paper"
		fullWidth
		maxWidth="sm"
	>
		<DialogTitle>
			{display_mode.edit_task === true ? '新计划' : '修改 ' + data.title}
			{
				display_mode.edit_task !== true ? (
					<IconButton title='删除' onClick={handleDelete} className='float-right p-[4px]'>
						<DeleteIcon />
					</IconButton>
				) : <></>
			}
		</DialogTitle>
		<DialogContent dividers>
			<Stack direction="row" spacing={0} className='w-full flex flex-row flex-wrap justify-start'>
				<div className='sm:me-[1em] sm:w-[48px] w-full justify-center flex flex-row flex-warp justify-center'>
					<Avatar
						title={display_mode.edit_task !== true ? data.uuid : '新计划'}
						sx={{ width: 48, height: 48 }}
						className={(() => {
							return data.stat === "Completed"
								? avatarColor.__completed
								: avatarColor[data.tag[0]] ?? '';
						})() + ' transition-all'}
					>
						{(data.title[0] ?? ' ').toUpperCase()}
					</Avatar>
				</div>
				<Box className='grow'>
					<TextField
						id="editTaskTitle"
						label="标题"
						placeholder="请输入标题..."
						fullWidth
						variant="standard"
						size="medium"
						defaultValue={data.title}
						onBlur={(e) => {
							patchData('title', e.target.value);
						}}
					/>
				</Box>
			</Stack>
			<div className='h-[1em]'></div>
			<div className='h-[1em]'></div>
			<Stack direction="row" spacing={0}>
				<Box className='sm:w-[64px]'></Box>
				<Box className='grow'>
					<Box>
						<Autocomplete
							multiple
							options={tagList}
							value={[...data.tag]}
							freeSolo
							renderTags={(value: readonly string[], getTagProps) => {
								return value.map((option: string, index: number) => {
									let tag_prop: any = getTagProps({ index });
									delete tag_prop.key;
									return (
										<Chip
											id={option}
											key={option}
											title={'标签 ' + option + ' 配色方案 ' + avatarColor[option] ?? '无'}
											variant="filled"
											size="small"
											label={option}
											avatar={
												<Avatar className={avatarColor[option] ?? ''}>
													{<span className='text-white'>{option[0].toUpperCase()}</span>}
												</Avatar>
											}
											{...tag_prop}
										/>
									);
								});
							}}
							onChange={(event: React.SyntheticEvent<Element, Event>, value: string[]) => {
								patchData('tag', value);
							}}
							renderInput={(params) => {
								return (
									<TextField
										{...params}
										variant="filled"
										label={
											<span
												title="编辑标签"
												onClick={handleEditTagList}
											>标签</span>
										}
										placeholder="选择或键入标签"
									/>
								);
							}}
						/>
					</Box>
					<div className='h-[1em]'></div>
					<Stack
						direction="row"
						spacing={0}
						className={
							"flex flex-row flex-wrap justify-center sm:justify-start " +
							"bg-[rgba(0,0,0,0.06)] sm:bg-inherit " +
							"border-b border-b-[rgba(0,0,0,0.42)] hover:border-b-[rgba(0,0,0,0.87)] border-solid sm:border-b-0 " +
							"px-[12px] pt-[20px] pb-[8px] sm:p-0 " +
							"rounded-t sm:rounded-none " +
							"transition"
						}
					>
						<Box className='justify-center'>
							<LocalizationProvider dateAdapter={AdapterDayjs}>
								<DateTimePicker
									label="开始时间"
									onChange={(v) => {
										let time = (v as any).$d;
										time.setSeconds(0);
										time.setMilliseconds(0);
										patchData('date', time);
									}}
									defaultValue={dayjs(data.date)}
									format="YYYY年MM月DD日 HH:mm"
								//orientation="landscape"
								/>
							</LocalizationProvider>
							<div className='h-[1em]' />
							<LocalizationProvider dateAdapter={AdapterDayjs}>
								<DateTimePicker
									label="截止时间"
									onChange={(v) => {
										let time = (v as any).$d;
										time.setSeconds(0);
										time.setMilliseconds(0);
										patchData('expire', time);
									}}
									defaultValue={dayjs(data.expire)}
									format="YYYY年MM月DD日 HH:mm"
								//orientation="landscape"
								/>
							</LocalizationProvider>
						</Box>
						<Box className="hidden ms-[1em] grow sm:flex flex-col transition-all">
							<Typography
								variant="button"
								paragraph
								gutterBottom
								className='grow text-end mb-0'
							>
								{
									dateOtp(data.expire.getTime() - data.date.getTime())
								}
							</Typography>
							<Typography
								variant="overline"
								paragraph
								gutterBottom
								className='mb-0 text-end'
							>
								remained
							</Typography>
						</Box>
					</Stack>
					<div className='h-[1em]'></div>
					<Box>
						<TextField
							label="描述"
							placeholder="请输入描述..."
							multiline
							variant="filled"
							fullWidth
							defaultValue={data.desc}
							onBlur={(e) => {
								patchData('desc', e.target.value);
							}}
						/>
					</Box>
				</Box>
			</Stack>
		</DialogContent>
		<DialogActions className='px-[24px] py-[1em]'>
			<Checkbox
				title={data.stat === "Active" ? '设为完成' : '设为进行中'}
				icon={<TaskAltIcon />}
				checkedIcon={<RadioButtonUncheckedIcon />}
				checked={data.stat === "Active"}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					patchData('stat', e.target.checked ? 'Active' : 'Completed');
				}}
			/>
			<div className='grow'></div>
			<Button title='放弃' variant="text" onClick={handleCancel}>放弃</Button>
			<Button title='完成' variant="contained" onClick={handleSave} style={{ backgroundColor: '#1976d2' }}>{display_mode.edit_task === true ? '创建' : '修改'}</Button>
		</DialogActions>
	</Dialog>);
}

function dateOtp(range: number) {

	if (range < 0) {
		return (
			<span className='text-red-500'>超时</span>
		);
	}
	return (
		<>
			{
				Math.floor(range / (24 * 60 * 60 * 1000)) !== 0 ?
					<>{Math.floor(range / (24 * 60 * 60 * 1000))} 日<br /></> :
					<></>
			}
			{
				Math.floor(range % (24 * 60 * 60 * 1000) / (60 * 60 * 1000)) !== 0 ?
					<>{Math.floor(range % (24 * 60 * 60 * 1000) / (60 * 60 * 1000))} 时<br /></> :
					<></>
			}
			{
				Math.floor(range % (60 * 60 * 1000) / (60 * 1000)) !== 0 ?
					<>{Math.floor(range % (60 * 60 * 1000) / (60 * 1000))} 分</> :
					<></>
			}
		</>
	);

}
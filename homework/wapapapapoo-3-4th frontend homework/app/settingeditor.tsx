'use client';

import * as React from 'react';

import Model from './model';
import { DisplayMode, DisplayModeAction } from './app';
import { TagList } from './model';

import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';

import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Switch from '@mui/material/Switch';
import FormHelperText from '@mui/material/FormHelperText';
import FormGroup from '@mui/material/FormGroup';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Link from '@mui/material/Link';

export default function EditSettings({ display_mode, switchDisplayMode }: {
	display_mode: DisplayMode,
	switchDisplayMode: (arg: DisplayModeAction) => void,
}) {
	const avatarColor: TagList = Model.getSetting('tags');
	const tagList = Object.keys(Model.getSetting('tags'));

	const init_default_color: TagList = {
		emergency: "bg-red-500",
		routine: "bg-blue-500",
		plain: "bg-lime-500",
		__completed: "",
		__error: "bg-red-700",
		undefined: "",
	};

	const default_settings = {
		ask_before_droptask: true,
		theme: 'light',
		page_size: 4,
		tags: init_default_color,
	};

	const [union_state, setUnionState]: [
		union_state: {
			data: {
				[key: string]: any,
			} | null,
		},
		setUnionState: Function,
	] = React.useState({
		data: null,
	});

	const readonly_data
		= union_state.data // 当前正在编辑的数据
		?? Model.getMetaData('settings') // 已存在的数据
		?? default_settings; // 默认的数据

	// 临时退出编辑，当前数据保留作自动填充
	function handleClose() {
		let new_state = { ...union_state };
		new_state.data = new_state.data;
		setUnionState(new_state);
		switchDisplayMode({
			action: 'close setting editor',
		});
	}

	// 取消编辑
	function handleCancel() {
		let new_state = { ...union_state };
		new_state.data = null;
		setUnionState(new_state);
		switchDisplayMode({
			action: 'close setting editor',
		});
	}

	// 存储数据
	function handleSave() {
		let new_state = { ...union_state };
		new_state.data = null;
		setUnionState(new_state);
		switchDisplayMode({
			action: 'close setting editor',
		});
		Object.keys(data).forEach(key => {
			Model.setSetting(key, data[key]);
		});
	}

	// 重置配置
	function handleReset() {
		let new_state = { ...union_state };
		new_state.data = Model.getMetaData('settings');
		setUnionState(new_state);
	}

	// 导入配置
	function handleImport() {
		let new_state = { ...union_state };
		let new_data_input = prompt('请输入数据');
		if (new_data_input === null) return;
		let new_data;
		try {
			new_data = JSON.parse(new_data_input) ?? Model.getMetaData('settings');
		} catch (e) {
			alert("Failed to parse json string \"" + new_data_input + "\" to local data\nException content: \n\t" + (e as Error).toString());
			return;
		}
		new_state.data = new_data;
		setUnionState(new_state);
	}

	// 修改数据
	function patchData(target: string, value: any) {
		let new_state = { ...union_state };
		new_state.data = data;
		(new_state.data as { [key: string]: any })[target] = value;
		setUnionState(new_state);
	}

	// 奇怪深复制，毫无匠人精神
	let data = JSON.parse(JSON.stringify(readonly_data));

	return (<Dialog
		open={display_mode.edit_setting ? true : false}
		onClose={handleClose}
		scroll="paper"
		fullWidth
		maxWidth="sm"
	>
		<DialogTitle className='p-0'>
			<Stack direction="row" spacing={0} className="w-full flex flex-row flex-wrap justify-center sm:justify-start">
				<Box className='grow'>
					<Tabs value={display_mode.edit_setting} onChange={(event: React.SyntheticEvent, value: 'data' | 'appearance' | 'info') => {
						switchDisplayMode({
							action: 'open setting editor',
							sheet: value,
						});
					}} centered>
						<Tab label="外观" value='appearance' />
						<Tab label="数据" value='data' />
						<Tab label="信息" value='info' />
					</Tabs>
				</Box>
				<IconButton title='重置' className='absolute p-[12px] right-[12px]' onClick={handleReset}>
					<ChangeCircleIcon />
				</IconButton>
			</Stack>
		</DialogTitle>
		<DialogContent dividers>
			<AppearanceSheet display_mode={display_mode} switchDisplayMode={switchDisplayMode} data={data} patchData={patchData} />
			<DataSheet display_mode={display_mode} switchDisplayMode={switchDisplayMode} data={data} patchData={patchData} handleCancel={handleCancel} />
			<InfoSheet display_mode={display_mode} switchDisplayMode={switchDisplayMode} data={data} patchData={patchData} />
		</DialogContent>
		<DialogActions className='px-[24px] py-[1em]'>
			<Button title='导入配置' variant="outlined" onClick={handleImport}>导入</Button>
			<div className='grow'></div>
			<Button title='放弃' variant="text" onClick={handleCancel}>放弃</Button>
			<Button title='完成' variant="contained" onClick={handleSave} className='bg-[#1976d2]'>存储</Button>
		</DialogActions>
	</Dialog>);
}

function AppearanceSheet({ display_mode, switchDisplayMode, data, patchData }: {
	display_mode: DisplayMode,
	switchDisplayMode: (arg: DisplayModeAction) => void,
	data: any,
	patchData: (target: string, value: any) => void,
}) {

	return (
		<>
			{display_mode.edit_setting === 'appearance' && (
				<Stack direction='column' spacing={1}>
					<Box>
						<FormControl onChange={(event) => {
							patchData('theme', (event.target as any).value);
						}}>
							<FormLabel>主题</FormLabel>
							<RadioGroup row>
								<FormControlLabel value='light' control={<Radio />} label='亮' checked={data.theme === 'light'} />
								<FormControlLabel value='dark' control={<Radio />} label='暗' checked={data.theme === 'dark'} />
							</RadioGroup>
						</FormControl>
					</Box>
					<Box>
						<FormControl className='w-full'>
							<FormLabel>每页任务数</FormLabel>
							<Slider
								aria-label="每页任务数"
								min={1}
								max={20}
								value={data.page_size ? data.page_size : 1}
								getAriaValueText={(value, index) => {
									return value.toString();
								}}
								step={1}
								valueLabelDisplay="auto"
								onChange={(event) => {
									patchData('page_size', Math.max(parseInt((event.target as any).value), 1));
								}}
								marks={[{ value: 1, label: '1' }, { value: 4, label: '4' }, { value: 10, label: '10' }, { value: 20, label: '20' }]}
							/>
						</FormControl>
						<FormHelperText>数量过大可能导致卡顿</FormHelperText>
					</Box>
					<Box>
						<FormLabel>标签</FormLabel>
						<div className='h-[1em]'></div>
						<TagEditor data={{ ...data.tags }} onChange={(value) => {
							patchData('tags', value);
						}} />
					</Box>
				</Stack>
			)}
		</>
	);
}

function TagEditor({ data, onChange }: {
	data: TagList,
	onChange: (value: TagList) => void,
}) {
	const [on_edit, edit]: [
		on_edit: string | null,
		edit: Function,
	] = React.useState(null);

	function create(name: string, color: string) {
		let new_data = { ...data };
		new_data[name] = color;
		onChange(new_data);
	}

	function drop(name: string) {
		let new_data = { ...data };
		delete new_data[name];
		onChange(new_data);
	}

	function patch(oldname: string, name: string, color: string) {
		let new_data = { ...data };
		delete new_data[oldname];
		new_data[name] = color;
		onChange(new_data);
	}

	let clipList: Array<React.ReactNode> = [];
	Object.keys(data).forEach(value => {
		clipList.push(
			<Chip
				key={value}
				variant='filled'
				size='medium'
				label={value}
				avatar={
					<Avatar className={data[value]}>
						{<span className='text-white'>{value[0].toUpperCase()}</span>}
					</Avatar>
				}
				onDelete={() => {
					drop(value);
				}}
				onClick={() => {
					edit(value);
				}}
			/>
		);
	});

	return (
		<Stack direction='column' spacing={1}>
			<Box>
				<Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
					{clipList}
					<Chip
						variant='filled'
						size='medium'
						label='新标签'
						avatar={
							<Avatar>
								{<span className='text-white'>+</span>}
							</Avatar>
						}
						onClick={() => {
							create(('newtask-' + Math.random().toString()), '');
						}}
					/>
				</Stack>
			</Box>
			{
				on_edit &&
				(() => {
					let tag: string = on_edit;
					let color: string = data[on_edit];
					return (
						<Card>
							<CardContent>
								<Stack direction="row" spacing={0} className='w-full flex flex-row flex-wrap justify-start'>
									<div className='sm:me-[1em] sm:w-[48px] w-full justify-center flex flex-row flex-warp justify-center'>
										<Avatar
											sx={{ width: 48, height: 48 }}
											className={data[on_edit] + ' transition-all'}
										>
											{((on_edit[0] ?? ' ') as string).toUpperCase()}
										</Avatar>
									</div>
									<Box className='grow'>
										<TextField
											label="标签"
											placeholder="请输入标签..."
											fullWidth
											variant="standard"
											size="medium"
											defaultValue={on_edit}
											onChange={(e) => {
												tag = (e.target.value as string);
											}}
										/>
									</Box>
								</Stack>
								<div className='h-[1em]'></div>
								<Box className='sm:ms-[64px]'>
									<TextField
										label="颜色"
										placeholder="请输入颜色..."
										variant="filled"
										fullWidth
										defaultValue={data[on_edit]}
										onChange={(e) => {
											color = e.target.value;
										}}
									/>
								</Box>
							</CardContent>
							<CardActions>
								<div className='grow'></div>
								<Button size="small" onClick={() => {
									edit(null);
								}}>放弃</Button>
								<Button size="small" onClick={() => {
									edit(null);
									patch(on_edit, tag, color);
								}}>确认</Button>
							</CardActions>
						</Card>
					);
				})()
			}
		</Stack>
	);
}

function DataSheet({ display_mode, switchDisplayMode, data, patchData, handleCancel }: {
	display_mode: DisplayMode,
	switchDisplayMode: (arg: DisplayModeAction) => void,
	data: any,
	patchData: (target: string, value: any) => void,
	handleCancel: Function,
}) {

	return (
		<>
			{display_mode.edit_setting === 'data' && (
				<Stack direction='column' spacing={1}>
					<Box>
						<FormLabel>操作确认</FormLabel>
						<FormGroup>
							<FormControlLabel
								control={
									<Switch checked={data.ask_before_droptask} onChange={(event, checked) => {
										patchData('ask_before_droptask', checked);
									}} />
								}
								label="删除/重置前询问"
							/>
							<FormHelperText>谨慎关闭</FormHelperText>
						</FormGroup>
					</Box>
					<Box>
						<FormLabel>转移数据</FormLabel>
						<div className='h-[.5em]'></div>
						<FormGroup>
							<Stack direction='column' spacing={1}>
								<Button variant="contained" color='success' className='bg-[#1976d2]' onClick={() => {
									let blob = new Blob([localStorage.getItem('main') ?? ''], { type: 'application/json' });
									let link = document.createElement('a');
									link.href = URL.createObjectURL(blob);
									link.download = 'data.json';
									link.click();
								}}>
									导出数据
								</Button>
								<Button component='label' variant='contained' color='warning' className='bg-[#1976d2]'>
									导入数据
									<input type='file'
										style={{
											clip: 'rect(0 0 0 0)',
											clipPath: 'inset(50%)',
											height: 1,
											overflow: 'hidden',
											position: 'absolute',
											bottom: 0,
											left: 0,
											whiteSpace: 'nowrap',
											width: 1,
										}}
										onChange={(event) => {
											let files = event.target.files;
											if (files && files.length && (Model.getSetting('ask_before_droptask') ? confirm("请确认是否导入\n新数据将覆盖原有数据") : true)) {
												let reader = new FileReader();
												reader.onload = function () {
													localStorage.setItem('main', new String(this.result).toString());
													handleCancel();
													location.reload();
												};
												reader.readAsText(files[0]);
											}
										}}
									/>
								</Button>
							</Stack>
						</FormGroup>
					</Box>
					<Box>
						<FormLabel>重置应用</FormLabel>
						<div className='h-[.5em]'></div>
						<FormGroup>
							<Stack direction='column' spacing={1}>
								<Button variant='contained' color='error' className='bg-[#1976d2]' onClick={() => {
									if (Model.getSetting('ask_before_droptask') ? confirm("请确认是否重置\n重置后不可恢复") : true) {
										Model.resetSettings();
										handleCancel();
										location.reload();
									}
								}}>
									重置配置
								</Button>
								<Button variant='contained' color='error' className='bg-[#1976d2]' onClick={() => {
									if (Model.getSetting('ask_before_droptask') ? confirm("请确认是否重置\n重置后不可恢复") : true) {
										localStorage.removeItem('main');
										handleCancel();
										location.reload();
									}
								}}>
									重置数据
								</Button>
							</Stack>
						</FormGroup>
					</Box>
				</Stack>
			)}
		</>
	);
}

function InfoSheet({ display_mode, switchDisplayMode, data, patchData }: {
	display_mode: DisplayMode,
	switchDisplayMode: (arg: DisplayModeAction) => void,
	data: any,
	patchData: (target: string, value: any) => void,
}) {
	const LS_MAXSIZE = 5242880;

	const space_limit = Model.getSetting('space_limit') ?? LS_MAXSIZE;

	const lssize = getLocalStorageSize();

	return (
		<>
			{display_mode.edit_setting === 'info' && (
				<Stack direction='column' spacing={1}>
					<Box>
						<FormLabel>已使用空间</FormLabel>
						<div className='h-[.5em]'></div>
						<Stack direction='row' spacing={1}>
							<Box>
								<Box className='inline-flex relative'>
									<CircularProgress
										variant="determinate"
										color={space_limit - lssize > 0 ? 'success' : 'error'}
										value={Math.round(lssize / space_limit * 100)}
									/>
									<Box
										className='top-0 left-0 bottom-0 right-0 absolute flex items-center justify-center'
									>
										<Typography
											variant="caption"
											component="div"
											color="text.secondary"
										>{`${Math.round(lssize / space_limit * 100)}%`}</Typography>
									</Box>
								</Box>
							</Box>
							<Box>
								<Typography
									variant="caption" component="div" color="text.secondary"
									className='top-0 left-0 bottom-0 right-0 h-[3.3em] relative flex items-center justify-center'
								>
									{`已使用 ${lssize} 字节`}
								</Typography>
							</Box>
						</Stack>
					</Box>
					<Box>
						<FormControl className='w-full'>
							<FormLabel>空间警示线</FormLabel>
							<Slider
								min={1}
								max={5 * 1024}
								value={data.space_limit / 1024}
								//getAriaValueText={(value, index) => (value.toString() + (value > 1024 ? 'MB' : 'KB'))}
								step={1}
								onChange={(event) => {
									patchData('space_limit', Math.max(parseInt((event.target as any).value), 1) * 1024);
								}}
								marks={[{ value: 1, label: '1Kb' }, { value: 1024, label: '1Mb' }, { value: 2 * 1024, label: '2Mb' }, { value: 5 * 1024, label: '5Mb' }]}
							/>
						</FormControl>
						<FormHelperText>建议配置：2Mb<Link className='no-underline select-none' onClick={() => patchData('space_limit', 2 * 1024 * 1024)}>　设置</Link></FormHelperText>
					</Box>
				</Stack >
			)
			}
		</>
	);
}

function getLocalStorageSize() {
	var size = 0;

	Object.keys(localStorage).forEach((item) => {
		if (localStorage.hasOwnProperty(item)) {
			size += (localStorage.getItem(item) ?? []).length;
		}
	})

	return size;
}
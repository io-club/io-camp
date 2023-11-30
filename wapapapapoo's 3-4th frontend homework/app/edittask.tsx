'use client';

import * as React from 'react';
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

import TaskAltIcon from "@mui/icons-material/TaskAlt";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import DeleteIcon from '@mui/icons-material/Delete';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';

import { Task } from './model';
import Model from './model';

export default function EditTask({
  open,
  mode,
  target,
  prefix,
  on,
}: {
  open: boolean,
  mode?: 'edit' | 'new',
  target?: string,
  prefix?: Task,
  on: {
    close: Function,
    cancel: Function,
    save: Function,
    del: Function,
  },
}) {
  const avatarColor = Model.getMetaData('tags');
  const tagList = Object.keys(Model.getMetaData('tags'));

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

  // 渲染的数据，优先级：当前正在编辑的数据，外部传入的预填充数据，组件自动填充记录的数据，默认数据
  const readonly_data: Task = union_state.data ?? prefix ?? union_state.auto_complete ?? defaultData;

  // 手工深复制，十分匠人精神
  let data: Task = {
    uuid: readonly_data.uuid,
    date: new Date(readonly_data.date),
    expire: new Date(readonly_data.expire),
    stat: readonly_data.stat,
    title: readonly_data.title,
    tag: [...readonly_data.tag],
    desc: readonly_data.desc,
  };

  // 数据时间取整分钟
  data.date.setSeconds(0);
  data.date.setMilliseconds(0);

  // 修改数据
  function patchData(target: string, value: string | Date | Array<string>) {
    let new_state = { ...union_state };
    new_state.data = data;
    new_state.data[target] = value;
    setUnionState(new_state);
  }

  // 临时退出编辑，当前数据保留作自动填充
  function handleClose() {
    let new_state = { ...union_state };
    new_state.auto_complete = new_state.data;
    new_state.data = null;
    setUnionState(new_state);
    on.close();
  }

  // 取消编辑
  function handleCancel() {
    let new_state = { ...union_state };
    new_state.auto_complete = null;
    new_state.data = null;
    setUnionState(new_state);
    on.cancel();
  }

  // 存储数据
  function handleSave() {
    let new_state = { ...union_state };
    new_state.auto_complete = null;
    new_state.data = null;
    setUnionState(new_state);
    if (mode === 'edit' && target !== undefined) {
      Model.editTask(target, data);
    } else if (mode === 'new') {
      Model.createTask(data);
    }
    on.save();
  }

  // 点击删除按钮
  // 临时退出编辑，父组件转入确认删除
  function handleDelete() {
    let new_state = { ...union_state };
    new_state.auto_complete = new_state.data;
    new_state.data = null;
    setUnionState(new_state);
    on.del(target);
  }

  return (<Dialog
    open={open}
    onClose={handleClose}
    scroll="paper"
    fullWidth
    maxWidth="sm"
  >
    <DialogTitle>
      {mode === 'new' ? '新计划' : '修改 ' + data.title}
      {
        mode === 'edit' ? (
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
            title={mode === 'edit' ? data.uuid : '新计划'}
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
      <Box className='sm:ms-[64px]'>
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
                label="标签"
                placeholder="请输入标签..."
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
          "flex flex-row flex-wrap justify-center sm:justify-start sm:ms-[64px] " +
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
              (() => {
                const range = data.expire.getTime() - data.date.getTime();

                if (range < 0) {
                  return (
                    <span className='text-red-500'>超时</span>
                  );
                }
                if (range >= 0 && range < 60 * 1000) {
                  return (
                    <>
                      {range / 1000} 秒
                    </>
                  );
                }
                if (range >= 60 * 1000 && range < 60 * 60 * 1000) {
                  return (
                    <>
                      {Math.floor(range / (60 * 1000))} 分
                      {
                        Math.floor(range % (60 * 1000) / 1000) !== 0 ?
                          <><br />{range % (60 * 1000) / 1000} 秒</> :
                          <></>
                      }
                    </>
                  );
                }
                if (range >= 60 * 60 * 1000 && range < 24 * 60 * 60 * 1000) {
                  return (
                    <>
                      {Math.floor(range / (60 * 60 * 1000))} 时
                      {
                        Math.floor(range % (60 * 60 * 1000) / (60 * 1000)) !== 0 ?
                          <><br />{Math.floor(range % (60 * 60 * 1000) / (60 * 1000))} 分</> :
                          <></>
                      }
                    </>
                  );
                }
                if (range >= 24 * 60 * 60 * 1000) {
                  return (
                    <>
                      {Math.floor(range / (24 * 60 * 60 * 1000))} 日
                      {
                        Math.floor(range % (24 * 60 * 60 * 1000) / (60 * 60 * 1000)) !== 0 ?
                          <><br />{Math.floor(range % (24 * 60 * 60 * 1000) / (60 * 60 * 1000))} 时</> :
                          <></>
                      }
                      {
                        Math.floor(range % (60 * 60 * 1000) / (60 * 1000)) !== 0 ?
                          <><br />{Math.floor(range % (60 * 60 * 1000) / (60 * 1000))} 分</> :
                          <></>
                      }
                    </>
                  );
                }

              })()
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
      <Box className='sm:ms-[64px]'>
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
      {/*<DialogContentText
        id="scroll-dialog-description"
        tabIndex={-1}
      >
      </DialogContentText>*/}
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
      <Button title='完成' variant="contained" onClick={handleSave} style={{ backgroundColor: '#1976d2' }}>{mode === 'new' ? '创建' : '修改'}</Button>
    </DialogActions>
  </Dialog>);
}
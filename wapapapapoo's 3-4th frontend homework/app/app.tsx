'use client';

// 页面未加载完前，localStorage不会生效
declare var localStorage: any | undefined;

import './globals.css'

import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { createSvgIcon } from '@mui/material/utils';

import TaskCard from './taskcard';
import EditTask from './edittask';

import { Task } from './model';
import Model from './model';

export default function App({ loaded, }: {
  loaded?: boolean,
}) {
  const PlusIcon = createSvgIcon(
    // credit: plus icon from https://heroicons.com/
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>,
    'Plus',
  );

  // 管理展示状态
  const [unionState, setUnionState]: [
    unionState: {
      scope: string,
      anchor: number,
      showcase: 'All' | 'Active' | 'Completed',
      //showtags: Array<string>,
      query: string | null,
      edittask: boolean | string,
      //page: Number,
      //page_size: Number,
    },
    setUnionState: Function,
  ] = React.useState({
    scope: 'main',
    anchor: 0,
    showcase: 'All',
    //showtags: [],
    query: '',
    edittask: false,
    //page: 1,
    //page_size: 10,
  });
  // 管理数据
  const [tdl, setTdl]: [
    tdl: {
      anchor: number,
      size: number,
      active: number,
      tasks: Array<Task>,
    },
    setTdl: Function,
  ] = React.useState(Model.getTaskList(handleQuery()));

  function newTask() {
    let lst = { ...unionState };
    lst.edittask = true;
    setUnionState(lst);
  }

  function editTask(task: string) {
    let lst = { ...unionState };
    lst.edittask = task;
    setUnionState(lst);
  }

  function closeEditTask(flush: boolean) {
    let lst = { ...unionState };
    lst.edittask = false;
    if (flush) lst.anchor++;
    setUnionState(lst);
  }

  function handleQuery() {
    if (unionState.showcase === 'Active') {
      return {
        query: unionState.query ? '((stat==="Active")&&((title.includes(decodeURI("' + encodeURI(unionState.query) + '")))||(tag.includes(decodeURI("' + encodeURI(unionState.query) + '")))||(desc.includes(decodeURI("' + encodeURI(unionState.query) + '")))))' : '(stat==="Active")',
      };
    } else if (unionState.showcase === 'Completed') {
      return {
        query: unionState.query ? '((stat==="Completed")&&((title.includes(decodeURI("' + encodeURI(unionState.query) + '")))||(tag.includes(decodeURI("' + encodeURI(unionState.query) + '")))||(desc.includes(decodeURI("' + encodeURI(unionState.query) + '")))))' : '(stat==="Completed")',
      };
    } else {
      return unionState.query ? {
        query: '((title.includes(decodeURI("' + encodeURI(unionState.query) + '")))||(tag.includes(decodeURI("' + encodeURI(unionState.query) + '")))||(desc.includes(decodeURI("' + encodeURI(unionState.query) + '"))))',
      } : {};
    }
  }

  function refreshTdl() {
    let newtdl = Model.getTaskList(handleQuery());
    newtdl.anchor = unionState.anchor;
    setTdl(newtdl);
  }

  function setShowcase(show: 'All' | 'Active' | 'Completed') {
    let lst = { ...unionState };
    lst.showcase = show;
    lst.anchor++;
    setUnionState(lst);
  }

  function setQuery(query: string) {
    let lst = { ...unionState };
    lst.query = query;
    if (query == '') lst.query = null;
    lst.anchor++;
    setUnionState(lst);
  }

  /*function setShowTags(show: Array<string>) {
    let lst = { ...unionState };
    lst.showtags = show;
    setUnionState(lst);
  }

  function setPage(show: Number) {
    let lst = { ...unionState };
    lst.page = show;
    setUnionState(lst);
  }

  function setPageSize(show: Number) {
    let lst = { ...unionState };
    lst.page_size = show;
    setUnionState(lst);
  }*/

  // localStorage生效后，传入Model
  if (typeof localStorage !== 'undefined') {
    Model.handleLocalStorage(localStorage);
  }

  if (unionState.anchor !== tdl.anchor) refreshTdl();

  let task_cards: Array<React.ReactNode> = [];
  tdl.tasks.forEach(v => {
    //if (unionState.showcase === 'Active' && v.stat === 'Completed') return;
    //if (unionState.showcase === 'Completed' && v.stat === 'Active') return;
    task_cards.push(
      <li key={v.uuid}>
        <TaskCard data={v} on={{
          edit: editTask,
          change: refreshTdl,
        }} />
      </li>
    );
  });

  return (
    <main className="max-w-md container mx-auto min-h-[100vh] flex flex-col pt-[10%] pb-[4em] px-[1em]">
      {(() => {
        if (loaded === false) {
          return (<div className='fixed h-full w-full z-50' onClick={e => { e.preventDefault() }}></div>);
        }
      })()}
      <div className="flex flex-col justify-center items-center sm">
        <h1 className="font-sans sm:text-[5em] text-[4em] text-stone-400 text-zinc-500 transition-all select-none">todos</h1>
        <div className='h-[1.5em]'></div>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }} className="w-full">
          <TextField
            fullWidth
            label='筛选计划'
            title='筛选'
            placeholder={loaded ? '今天干点啥？' : ''}
            variant="outlined"
            className="w-full"
            onBlur={e => {
              setQuery(e.target.value);
            }}
          />
        </Box>
        <div className='h-[1em]'></div>
        <Stack direction="row" spacing={4} className="w-full flex flex-row flex-wrap justify-center sm:justify-start">
          <Button
            title='新计划'
            value="check"
            variant="outlined"
            onClick={() => {
              newTask();
            }}
            style={{
              marginLeft: 0,
              minWidth: 0,
              maxHeight: '38px',
              padding: '6px 6px',
              marginBottom: '1em',
            }}
            className='shrink-0 mb-[1em] grow-0'
          ><PlusIcon /></Button>
          <div className='grow ml-0 mb-[1em] sm:grow-0 transition-all' style={{
            marginLeft: 0,
            marginBottom: '1em',
          }}></div>
          <Button
            title={'已完成' + (tdl.size - tdl.active).toString() + '/' + tdl.size.toString() + '项计划'}
            variant="text"
            onClick={() => {
              setShowcase('Active');
            }}
            className='ml-0 shrink-0 mb-[1em]'
            style={{
              marginLeft: '.5em',
              marginBottom: '1em',
            }}
          >
            {
              (tdl.active < 100) ? (tdl.active < 1 ? 'No' : tdl.active.toString()) : '99+'
            } tasks left</Button>
          <div className='grow-0 ml-0 mb-[1em] sm:grow transition-all' style={{
            marginLeft: 0,
            marginBottom: '1em',
          }}></div>
          <ToggleButtonGroup
            size="small"
            {...{
              value: unionState.showcase,
              onChange: (
                event: React.MouseEvent<HTMLElement>,
                newShowcase: 'All' | 'Active' | 'Completed',
              ) => {
                setShowcase(newShowcase);
              },
              exclusive: true,
            }}
            aria-label="Small sizes"
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
        <ol className='w-full'>
          {task_cards}
        </ol>
        <EditTask
          open={unionState.edittask ? true : false}
          mode={typeof unionState.edittask === 'string' ? 'edit' : 'new'}
          target={typeof unionState.edittask === 'string' ? unionState.edittask : undefined}
          prefix={tdl.tasks.find(v => (v.uuid === unionState.edittask)) ?? undefined}
          on={{
            close: () => { closeEditTask(false) },
            cancel: () => { closeEditTask(true) },
            save: () => { closeEditTask(true) },
            del: (target: string) => { if (confirm('Would you really like to drop this task?')) { Model.dropTask(target); closeEditTask(true); } },
          }}
        />
      </div>
    </main>
  )
}
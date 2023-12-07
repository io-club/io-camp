'use client';

// 页面未加载完前，localStorage不会生效
declare var localStorage: any | undefined;

import * as React from 'react';

import './globals.css'

import LinearProgress from '@mui/material/LinearProgress';

import App from './app';
import Model from './model';

export default function Home() {

	const [state, setState]: [
		state: string,
		setState: Function
	] = React.useState('load');

	React.useEffect(() => {
		// localStorage生效后，传入Model
		if (typeof localStorage !== 'undefined') {
			Model.handleLocalStorage(localStorage);
		}

		Model.reloadData();
		setState('loaded');
	}, []);

	if (state === 'load') return (
		<main>
			<LinearProgress style={{
				position: 'fixed',
				width: '100%',
				top: 0,
			}} />
			<App />
			<div className='fixed h-full w-full z-50' onClick={e => { e.preventDefault() }}></div>
		</main>
	);

	if (state === 'loaded') return (
		<main>
			<App />
		</main>
	);
}
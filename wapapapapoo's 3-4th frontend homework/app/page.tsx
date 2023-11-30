'use client';

// 页面未加载完前，localStorage不会生效
declare var localStorage: any | undefined;

import * as React from 'react';
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
		setState('loaded');
	}, []);

	// ? 为什么在页面加载前调用一遍App，tailwind css才不会被覆盖 ?
	if (state === 'load') return (
		<>
			<LinearProgress style={{
				position: 'fixed',
				width: '100%',
				top: 0,
			}} />
			<App loaded={false} />
		</>
	);

	if (state === 'loaded') return (
		<App loaded />
	);
}
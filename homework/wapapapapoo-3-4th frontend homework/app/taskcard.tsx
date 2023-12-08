'use client';

import * as React from 'react';
import { useState, useContext, useReducer, useRef, useEffect } from 'react';

import Model from './model';
import { DisplayMode, DisplayModeAction } from './app';
import { Task, TagList } from './model';

import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import CardHeader from "@mui/material/CardHeader";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";

import CreateIcon from "@mui/icons-material/Create";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

// 这两段是demo上的，不敢动不敢动
// 虽然大概明白了，但还是不敢动
interface ExpandMoreProps extends IconButtonProps {
	expand: boolean;
}

const ExpandMore = styled(
	(props: ExpandMoreProps) => {
		const { expand, ...other } = props;
		return <IconButton {...other} />;
	}
)(
	({ theme, expand }) => (
		{
			transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
			marginLeft: "auto",
			transition: theme.transitions.create(
				"transform",
				{
					duration: theme.transitions.duration.shortest,
				}
			),
		}
	)
);

export default function TaskCard({ data, version, display_mode, switchDisplayMode }: {
	data: Task,
	version: number,
	display_mode: DisplayMode,
	switchDisplayMode: (arg: DisplayModeAction) => void,
}) {

	const avatarColor: TagList = Model.getSetting('tags');

	const [expanded, setExpanded] = React.useState(false);
	const handleExpandClick = () => {
		setExpanded(!expanded);
	};

	function handleStatChange(e: React.ChangeEvent<HTMLInputElement>) {
		Model.editTask(data.uuid, { stat: e.target.checked ? 'Active' : 'Completed' });
	}

	function handleEdit() {
		switchDisplayMode({
			action: 'open task editor',
			target: data.uuid,
		});
	}

	// 描述切分成段
	let content: Array<React.ReactNode> = [];
	data.desc.split("\n").forEach((v, k) => {
		content.push(
			<Typography key={k} paragraph variant="body2" color="text.secondary">
				{v}
			</Typography>
		);
	});

	return (
		<Card variant="outlined" className="mb-[1em]">
			<CardHeader
				avatar={
					<Avatar
						title={data.uuid}
						className={(() => {
							return data.stat === "Completed"
								? avatarColor.__completed + ' transition-all'
								: avatarColor[data.tag[0]] + ' transition-all' ?? 'transition-all';
						})()}
					>
						{(data.title[0] ?? ' ').toUpperCase()}
					</Avatar>
				}
				action={
					<IconButton onClick={handleEdit} title='修改'>
						<CreateIcon />
					</IconButton>
				}
				title={data.title == '' ? '<empty string>' : data.title}
				subheader={data.expire.toLocaleDateString() + (data.tag.length > 0 ? ' · ' + data.tag.join(' · ') : '')}
			/>
			<CardActions disableSpacing>
				<Checkbox
					title={data.stat === "Active" ? '进行中' : '完成'}
					icon={<TaskAltIcon />}
					checkedIcon={<RadioButtonUncheckedIcon />}
					checked={data.stat === "Active"}
					onChange={handleStatChange}
				/>
				<ExpandMore
					title='详情'
					expand={expanded}
					onClick={handleExpandClick}
					aria-expanded={expanded}
				>
					<ExpandMoreIcon />
				</ExpandMore>
			</CardActions>
			<Collapse in={expanded} timeout="auto" unmountOnExit>
				<CardContent>
					{content}
				</CardContent>
			</Collapse>
		</Card>
	);

}
'use client';

export type Task = {
	[k: string]: string | Date | Array<string>,
	uuid: string,
	date: Date,
	expire: Date,
	stat: 'Active' | 'Completed',
	title: string,
	tag: Array<string>,
	desc: string,
};

export type IncompletedTask = {
	[k: string]: string | Date | Array<string> | undefined,
	uuid?: string,
	date?: Date,
	expire?: Date,
	stat?: 'Active' | 'Completed',
	title?: string,
	tag?: Array<string>,
	desc?: string,
};

/*export enum OrderBy {
	UUID,
	Date,
	Expire,
	Stat,
	Tag,
	Title,
};*/

const init_default_color = {
	emergency: "bg-red-500",
	routine: "bg-blue-500",
	plain: "bg-lime-500",
	__completed: "",
	__error: "bg-red-700",
	undefined: "",
};

const init_meta_data = {
	size: 0,
	active: 0,
	tags: init_default_color,
};

/*const init_task_list: Array<Task> = [
	{
		uuid: '__TDL bug 1',
		date: new Date(),
		expire: new Date(Date.now() + 3 * 60 * 60 * 1000),
		stat: 'Active',
		title: "Bug: 未进行操作时，页面上的数据无法更新",
		tag: ['__error'],
		desc: "文档加载完成前，localStorage API不可用，导致首屏无法展示数据。\n此任务由程序预定义。",
	},
	{
		uuid: '__TDL bug 2',
		date: new Date(),
		expire: new Date(Date.now() + 3 * 60 * 60 * 1000),
		stat: 'Active',
		title: "Bug: EditTask组件出现奇怪报错",
		tag: ['__error'],
		desc: "MUI: A component is changing the default value state of an uncontrolled Autocomplete after being initialized. To suppress this warning opt to use a controlled Autocomplete.",
	},
	{
		uuid: '__TDL bug 3',
		date: new Date(),
		expire: new Date(Date.now() + 3 * 60 * 60 * 1000),
		stat: 'Active',
		title: "Bug: EditTask组件出现奇怪报错",
		tag: ['__error'],
		desc: "Warning: A props object containing a \"key\" prop is being spread into JSX:\nlet props = {key: someKey, id: ..., variant: ..., size: ..., label: ..., avatar: ..., className: ..., disabled: ..., data-tag-index: ..., tabIndex: ..., onDelete: ...};",
	},
];*/

const init_task_list: Array<Task> = [];

const err_meta_data = {
	size: 1,
	active: 1,
	tags: {
		__error: "bg-red-700",
	},
};

const err_data_damaged_task_list: Array<Task> = [
	{
		uuid: '__TDL error',
		date: new Date(),
		expire: new Date(Date.now() + 3 * 60 * 60 * 1000),
		stat: 'Active',
		title: 'Fatal Error: Data Damaged',
		tag: ['__error'],
		desc: 'This is an error message comes from todos.\nYour data storaged in localStorage has been damaged and failed to be parsed from JSON string.\nPlease dump the localStorage data and try to fix it.',
	},
];

const meta_data_keys = ['size', 'active', 'tags'];

class Model {

	/**
	 * localStorage API
	 * 文档加载前，localStorage不可用。这里用空函数代替
	 * localStorage生效后，从外部调用handleLocalStorage传入
	 */
	private localStorage: any = {
		getItem: (scope: string) => {
			return null;
		},
		setItem: (scope: string, data: string) => {

		},
	};

	public handleLocalStorage(ls: any) {
		this.localStorage = ls;
	}

	private scope: string = "main";

	// 锚点，更新数据时递增
	// 确保视图层与数据模型同步
	static anchor: number = 0;

	private task_list: Array<Task | undefined> = [];
	private meta_data: {
		[keys: string]: any,
	} = {};

	constructor(scope: string) {
		this.scope = scope;
		this.loadData();
	}

	/**
	 * 从数据源加载数据
	 * 或在无数据源的情况下加载默认数据
	 */
	private loadData() {
		let lsdata = this.localStorage.getItem(this.scope);
		if (lsdata === null) {
			this.meta_data = init_meta_data;
			this.task_list = init_task_list;
			return;
		}

		let data: any;
		try {
			data = JSON.parse(lsdata);
		} catch (e) {
			this.meta_data = err_meta_data;
			this.task_list = err_data_damaged_task_list;
			return;
		}

		this.task_list = data.tasks;
		this.meta_data = {};
		meta_data_keys.forEach(e => {
			this.meta_data[e] = data[e];
		});

		if (!this.meta_data.tags)
			this.meta_data.tags = init_default_color;
	}

	/*private fetchData({
		range_start,
		range_end,
		order,
		query,
	}: {
		range_start?: number;
		range_end?: number;
		order?: OrderBy;
		query?: QueryStatement;
	}) {

	}*/

	/**
	 * 外部获取元数据
	 * @param key
	 * @returns 
	 */
	public getMetaData(key: string) {
		return this.meta_data[key];
	}

	/**
	 * 将数据存回源
	 */
	private syncStorage() {
		let data = {
			...this.meta_data,
			tasks: this.task_list,
		};
		this.localStorage.setItem(this.scope, JSON.stringify(data));
	}

	/**
	 * 条件判断
	 * @param task 
	 * @param query 
	 * @returns 
	 */
	private filterTask(task: Task, query?: string | ((task: Task) => boolean)): boolean {
		if (query === undefined) return true;
		if (typeof query === 'function') return query(task);
		let uuid = task.uuid;
		let date = task.date;
		let expire = task.expire;
		let stat = task.stat;
		let title = task.title;
		let tag = task.tag;
		let desc = task.desc;
		return eval(query);
	}

	/**
	 * C
	 * @param new_task prop uuid will be ignored
	 */
	public createTask(new_task: Task) {
		new_task.uuid = (this.meta_data.size + Math.random()).toString();

		this.meta_data.size++;
		if (new_task.stat === 'Active')
			this.meta_data.active++;

		this.task_list.push(new_task);

		this.syncStorage();
		Model.anchor++;
	}

	/**
	 * U
	 * @param uuid target
	 * @param new_task data
	 */
	public editTask(uuid: string, new_task: IncompletedTask) {
		let index = this.task_list.indexOf(this.task_list.find(e => e && e.uuid === uuid));
		if (index === undefined || this.task_list[index] === undefined) return; // 以后做了懒加载这里要扩展

		// 逆天类型系统
		if ((this.task_list[index] ?? { stat: '' }).stat === 'Active' && new_task.stat === 'Completed') this.meta_data.active--;
		if ((this.task_list[index] ?? { stat: '' }).stat === 'Completed' && new_task.stat === 'Active') this.meta_data.active++;

		let bin: Task = {
			...init_task_list[0]
		};
		Object.keys(new_task).forEach(e => {
			if (e === 'uuid') return;
			if (new_task[e] !== undefined) {
				(this.task_list[index] ?? bin)[e] = new_task[e] ?? '';
			}
		});

		this.syncStorage();
		Model.anchor++;
	}

	/**
	 * R
	 * @param arg
	 * @returns 
	 */
	public getTaskList({
		//range_start,
		//range_end,
		//order,
		query,
	}: {
		//range_start?: number;
		//range_end?: number;
		//order?: OrderBy;
		query?: string | ((task: Task) => boolean);
	}): {
		anchor: number, // 结果id，用于更新数据
		size: number,
		active: number,
		tasks: Array<Task>,
	} {

		this.loadData();

		let result = {
			anchor: Model.anchor,
			size: 0,
			active: 0,
			tasks: new Array(),
		};

		result.size = this.meta_data.size;
		result.active = this.meta_data.active;

		this.task_list.forEach(e => {
			if (e !== undefined && this.filterTask(e, query)) {
				e.date = new Date(e.date);
				e.expire = new Date(e.expire);
				result.tasks.push(e);
			}
		});

		Model.anchor++;

		return result;
	}

	/**
	 * D
	 * @param uuid target
	 */
	public dropTask(uuid: string) {
		let index = this.task_list.indexOf(this.task_list.find(e => e && e.uuid === uuid));
		if (index === undefined || this.task_list[index] === undefined) return; // 以后做了懒加载这里要扩展

		this.meta_data.size--;
		if ((this.task_list[index] ?? { stat: '' }).stat === 'Active')
			this.meta_data.active--;

		this.task_list.splice(index, 1);

		this.syncStorage();
		Model.anchor++;
	}

}

// 该类保持单例
let model = new Model('main');

export default model;

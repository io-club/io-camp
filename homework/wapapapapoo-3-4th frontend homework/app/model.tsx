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

export type TagList = {
	[key: string]: string;
};

/*export enum OrderBy {
	UUID,
	Date,
	Expire,
	Stat,
	Tag,
	Title,
};*/

const init_default_color: TagList = {
	emergency: "bg-red-500",
	routine: "bg-blue-500",
	plain: "bg-lime-500",
	__completed: "",
	__error: "bg-red-700",
	undefined: "",
};

const init_default_settings = {
	ask_before_droptask: true,
	theme: 'light',
	page_size: 4,
	space_limit: 1024 * 1024,
	tags: init_default_color,
};

const init_meta_data = {
	size: 0,
	active: 0,
	settings: init_default_settings,
};

const init_task_list: Array<Task> = [];

const err_meta_data = {
	size: 1,
	active: 1,
	settings: {
		page_size: 1,
		space_limit: 1024 * 1024,
		ask_before_droptask: false,
		theme: 'light',
		tags: {
			__error: "bg-red-700",
		},
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

const meta_data_keys = ['size', 'active', 'settings'];

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

	// 数据小版本，生命周期与程序同
	// 确保视图层与数据模型同步
	static version: number = 0;

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
		this.task_list.forEach(value => {
			if (value !== undefined) {
				value.date = new Date(value.date);
				value.expire = new Date(value.expire);
			}
		});

		this.meta_data = {};
		meta_data_keys.forEach(e => {
			this.meta_data[e] = data[e];
		});

		if (!this.meta_data.settings)
			this.meta_data.settings = init_default_settings;
		if (!this.meta_data.settings.tags)
			this.meta_data.settings.tags = init_default_color;
		this.meta_data.settings.page_size ??= init_meta_data.settings.page_size;
		this.meta_data.settings.ask_before_droptask ??= init_meta_data.settings.ask_before_droptask;
		this.meta_data.settings.theme ??= init_meta_data.settings.theme;
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
	 * 外部获取设置
	 * @param key
	 * @returns 
	 */
	public getSetting(key: string) {
		return this.meta_data.settings[key];
	}

	/**
	 * 外部修改设置
	 * @param key
	 */
	public setSetting(key: string, value: any) {
		this.meta_data.settings[key] = value;

		this.syncStorage();
		Model.version++;
		this.triggerEvent('change');
	}

	/**
	 * 重置设置为默认值
	 */
	public resetSettings() {
		this.meta_data.settings = init_default_settings;

		this.syncStorage();
		Model.version++;
		this.triggerEvent('change');
	}

	/**
	 * 将数据同步回存储
	 */
	private syncStorage() {
		let data = {
			...this.meta_data,
			tasks: this.task_list,
		};
		this.localStorage.setItem(this.scope, JSON.stringify(data));
	}

	/**
	 * 获取当前数据版本
	 * @returns 当前数据版本
	 */
	public getDataVersion() {
		return Model.version;
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
		Model.version++;
		this.triggerEvent('change');
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
		Model.version++;
		this.triggerEvent('change');
	}

	/**
	 * R
	 * @param arg
	 * @returns 
	 */
	public getTasks({
		range_start,
		range_end,
		//order,
		query,
	}: {
		range_start?: number;
		range_end?: number;
		//order?: OrderBy;
		query?: string | ((task: Task) => boolean);
	}): {
		version: number,
		size: number,
		tasks: Array<Task>,
	} {

		this.loadData();

		let result = {
			size: 0,
			version: Model.version,
			tasks: new Array(),
		};

		this.task_list.forEach((value, index) => {
			if (value !== undefined && this.filterTask(value, query))
				result.tasks.push(value);
		});

		result.size = result.tasks.length;

		if (range_start !== undefined && range_end !== undefined)
			result.tasks = result.tasks.slice(range_start, range_end);
		else if (range_start !== undefined)
			result.tasks = result.tasks.slice(range_start);
		else if (range_end !== undefined)
			result.tasks = result.tasks.slice(0, range_end);

		return result;
	}

	public getTask(uuid: string) {
		let index = this.task_list.indexOf(this.task_list.find(e => e && e.uuid === uuid));
		if (index === undefined || this.task_list[index] === undefined) return; // 以后做了懒加载这里要扩展

		return this.task_list[index];
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
		Model.version++;
		this.triggerEvent('change');
	}

	public reloadData() {
		this.loadData();
	}

	private on_change_handles: {
		[handle: string]: ((current_version: number, handle: string) => void),
	} = {};

	public addEventListener(event: string, callback: ((current_version: number, handle: string) => void)): string | undefined {
		switch (event) {
			case 'change':
				let handle = Math.random().toString();
				this.on_change_handles[handle] = callback;
				return handle;
				break;
		}
	}

	public removeEventListener(event: string, handle: string) {
		switch (event) {
			case 'change':
				delete this.on_change_handles[handle];
				break;
		}
	}

	/*getIterKeys<T extends object>(dict: T) {
		return Object.keys(dict).map(x => x as keyof T);
	}*/

	private triggerEvent(event: string) {
		switch (event) {
			case 'change':
				Object.keys(this.on_change_handles).forEach((key) => {
					this.on_change_handles[key](Model.version, key);
				});
				break;
		}
	}

}

// 该类保持单例
let model = new Model('main');

export default model;

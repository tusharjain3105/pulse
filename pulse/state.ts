class Scheduler {
	private tasks = new Set<() => void>();
	private microTasks = new Set<() => void>();
	private batchTasks = new Set<() => void>();

	private isRunning = false;
	private isScheduled = false;

	schedule(task: () => void) {
		this.tasks.add(task);
		this.scheduleRun();
	}

	scheduleMicro(task: () => void) {
		this.microTasks.add(task);
		this.scheduleRun();
	}

	scheduleBatch(task: () => void) {
		this.batchTasks.add(task);
		this.scheduleRun();
	}

	private scheduleRun() {
		if (this.isScheduled) return;
		this.isScheduled = true;
		queueMicrotask(() => {
			this.isScheduled = false;
			this.run();
		});
	}

	private run() {
		if (this.isRunning) return;
		this.isRunning = true;

		// Copy to prevent modification during execution
		const microRun = Array.from(this.microTasks);
		const taskRun = Array.from(this.tasks);
		const batchRun = Array.from(this.batchTasks);

		this.microTasks.clear();
		this.tasks.clear();
		this.batchTasks.clear();

		// Run microtasks first
		microRun.forEach((task) => {
			this.runTaskSafe(task);
		});
		// Then tasks
		taskRun.forEach((task) => {
			this.runTaskSafe(task);
		});
		// Then batch tasks
		batchRun.forEach((task) => {
			this.runTaskSafe(task);
		});

		this.isRunning = false;
	}

	private runTaskSafe(task: () => void) {
		try {
			task();
		} catch (e) {
			// Log or handle errors without blocking
			console.error("Scheduler task error:", e);
		}
	}
}

export const scheduler = new Scheduler();

// Common Types
type VoidFunction = () => void;

// Symbols for identifications
const SYM_STATE = Symbol("state");

// State management

interface State<T = unknown> {
	value: T;
	peek(): T;
	subscribe(
		cb: (newValue: T, oldValue: T | undefined) => void,
		opts?: { key?: string },
	): VoidFunction;
	[SYM_STATE]: true;
}

type StateSubscriber<T = unknown> = Parameters<State<T>["subscribe"]>[0];

export const state = <T = unknown>(initialValue: T): State<T> => {
	const subscribers = new Set<StateSubscriber<T>>();
	const stateSubscriptionMap = new Map<string, StateSubscriber>();

	let value = initialValue;
	let scheduled = false;
	let oldVal: T | undefined;

	const get = () => value;

	const set = (newValue: T) => {
		if (value !== newValue) {
			// On first change in this batch, save the old value
			if (!scheduled) {
				oldVal = value;
			}
			value = newValue;

			if (!scheduled) {
				scheduled = true;
				scheduler.scheduleMicro(() => {
					scheduled = false;
					// Notify subscribers with the initial old value and final new value
					subscribers.forEach((subscriber) => {
						subscriber(value, oldVal);
					});
					oldVal = undefined;
				});
			}
		}
	};

	return {
		get value() {
			updateSubscribers(subscribers);
			return get();
		},
		set value(newValue) {
			set(newValue);
		},
		peek: () => value,
		subscribe: (cb, opts) => {
			const key = opts?.key;
			const newCb = stateSubscriptionMap.get(key) ?? cb;

			if (key) {
				stateSubscriptionMap.set(key, newCb);
			}

			subscribers.add(newCb);
			return () => subscribers.delete(newCb);
		},
		[SYM_STATE]: true,
	};
};

// Computed
const computedStack = new Set<StateSubscriber>();
const updateSubscribers = <T>(subscribers: Set<StateSubscriber<T>>) =>
	computedStack.forEach((recompute) => {
		subscribers.add(recompute);
	});

export const computed = <T>(
	fn: () => T,
): Omit<State<T>, "value"> & { readonly value: T } => {
	const computedSubscriptionMap = new Map<string, StateSubscriber>();
	const subscribers = new Set<StateSubscriber<T>>();
	let result: T | undefined;
	let oldVal: T | undefined;

	const subscribe = () => {
		oldVal = result;
		result = fn();
		subscribers.forEach((subscriber) => {
			subscriber(result!, oldVal);
		});
	};
	computedStack.add(subscribe);
	result = fn();
	computedStack.delete(subscribe);

	return {
		get value() {
			updateSubscribers(subscribers);
			return result!;
		},
		subscribe: (
			cb: (newValue: T, oldValue: T | undefined) => void,
			opts?: { key?: string },
		) => {
			const key = opts?.key;
			const newCb = computedSubscriptionMap.get(key) ?? cb;

			if (key) {
				computedSubscriptionMap.set(key, newCb);
			}

			subscribers.add(newCb);
			return () => subscribers.delete(newCb);
		},
		peek: () => result!,
		[SYM_STATE]: true,
	};
};

export const isReactive = (value: unknown): value is State =>
	value?.[SYM_STATE] === true;

const SYM_REACTIVE = Symbol("reactive");
export const reactive = <T extends Function>(fn: T): T => {
	fn[SYM_REACTIVE] = true;
	return fn;
};

export const isReactiveFunction = (fn: unknown): fn is () => unknown =>
	fn?.[SYM_REACTIVE] === true;

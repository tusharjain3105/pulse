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
const SYM_REACTIVE_STATE = Symbol();
const SYM_REACTIVE_FUNCTION = Symbol();

// State management
interface State<T = unknown> {
	value: T;
	peek(): T;
	subscribe(
		cb: (newValue: T, oldValue: T | undefined) => void,
		opts?: { key?: string },
	): VoidFunction;
	[SYM_REACTIVE_STATE]: true;
	subscriptions: number;
	type: "state" | "computed";
	isReactive: boolean;
}

type StateSubscriber<T = unknown> = Parameters<State<T>["subscribe"]>[0];

export const state = <T = unknown>(initialValue: T): State<T> => {
	const subscribers = new Set<StateSubscriber<T>>();
	const stateSubscriptionMap = new Map<string, StateSubscriber<T>>();

	let value = createProxyIfObject(initialValue, () => notify());
	let scheduled = false;
	let oldVal: T | undefined;

	const notify = () => {
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
	};

	const get = () => value;

	const set = (newValue: T) => {
		if (value !== newValue) {
			// On first change in this batch, save the old value
			if (!scheduled) {
				oldVal = value;
			}
			value = newValue;
			notify();
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
			const newCb = key ? (stateSubscriptionMap.get(key) ?? cb) : cb;

			if (key) {
				stateSubscriptionMap.set(key, newCb);
			}

			subscribers.add(newCb);
			return () => subscribers.delete(newCb);
		},
		[SYM_REACTIVE_STATE]: true,
		subscriptions: subscribers.size,
		type: "state",
		isReactive: true,
	};
};

// Proxy to get updates from nested values
const createProxyIfObject = <T>(value: T, onChange?: () => void) => {
	if (typeof value !== "object" || value === null) return value;
	return new Proxy(value, {
		get: (target, prop) => {
			if (typeof target[prop as keyof T] === "object") {
				return createProxyIfObject(target[prop as keyof T], onChange);
			}
			return target[prop as keyof T];
		},
		set: (target, prop, value) => {
			target[prop as keyof T] = value;
			onChange?.();
			return true;
		},
	});
};

// Computed
const computedStack = new Set<StateSubscriber>();
const updateSubscribers = <T>(subscribers: Set<StateSubscriber<T>>) =>
	computedStack.forEach((subscribe) => {
		// @ts-expect-error subscriptions is not part
		subscribe.subscriptions = subscribe.subscriptions + 1;
		subscribers.add(subscribe);
	});

export const computed = <T>(
	fn: () => T,
): Omit<State<T>, "value"> & { readonly value: T; isReactive: boolean } => {
	const computedSubscriptionMap = new Map<string, StateSubscriber<T>>();
	const subscribers = new Set<StateSubscriber<T>>();
	let result: T | undefined;
	let oldValue: T | undefined;

	const subscribe = () => {
		oldValue = result;
		result = fn();
		if (result !== oldValue) {
			subscribers.forEach((subscriber) => {
				subscriber(result!, oldValue);
			});
		}
	};

	subscribe.subscriptions = 0;

	computedStack.add(subscribe);
	result = fn();
	const isReactive = subscribe.subscriptions > 0;
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
			const newCb = key ? (computedSubscriptionMap.get(key) ?? cb) : cb;

			if (key) {
				computedSubscriptionMap.set(key, newCb);
			}

			subscribers.add(newCb);
			return () => subscribers.delete(newCb);
		},
		peek: () => result!,
		[SYM_REACTIVE_STATE]: true,
		subscriptions: subscribers.size,
		isReactive,
		type: "computed",
	};
};

export const isReactiveState = (value: any): value is State =>
	value?.[SYM_REACTIVE_STATE] === true;

export const reactive = <
	T extends Function & { [SYM_REACTIVE_FUNCTION]?: true },
>(
	fn: T,
): T => {
	fn[SYM_REACTIVE_FUNCTION] = true;
	return fn;
};

export const isReactiveFunction = (fn: any): fn is () => unknown =>
	fn?.[SYM_REACTIVE_FUNCTION] === true;

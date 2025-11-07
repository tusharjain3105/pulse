import { computed, reactive, state } from "pulse/state";

interface Profile {
	name: string;
	settings: { notifications: boolean; theme: string };
	stats: { posts: number; followers: number };
}

const profile = state<Profile>({
	name: "John Doe",
	settings: { notifications: true, theme: "auto" },
	stats: { posts: 42, followers: 128 },
});

const engagement = computed(() =>
	profile.value.stats.followers > 0
		? (
				(profile.value.stats.posts / profile.value.stats.followers) *
				100
			).toFixed(1)
		: "0",
);

export function NestedState() {
	const updateName = (name: string) => {
		profile.value = { ...profile.value, name };
	};

	const toggleNotifications = () => {
		profile.value = {
			...profile.value,

			settings: {
				...profile.value.settings,
				notifications: !profile.value.settings.notifications,
			},
		};
	};

	const incrementPosts = () => {
		profile.value = {
			...profile.value,
			stats: { ...profile.value.stats, posts: profile.value.stats.posts + 1 },
		};
	};

	return (
		<div class="nested-state">
			<h3>Nested State Updates</h3>
			<div class="profile-card">
				<h4>{reactive(() => profile.value.name)}</h4>
				<p>Posts: {reactive(() => profile.value.stats.posts)}</p>
				<p>Followers: {reactive(() => profile.value.stats.followers)}</p>
				<p>Engagement: {reactive(() => engagement.value)}%</p>
				<p>
					Notifications:{" "}
					{reactive(() =>
						profile.value.settings.notifications ? "On" : "Off",
					)}
				</p>
			</div>

			<div class="controls">
				<input
					type="text"
					value={reactive(() => profile.value.name)}
					onInput={(e) => updateName((e.target as HTMLInputElement).value)}
					placeholder="Name"
				/>
				<button onClick={toggleNotifications}>Toggle Notifications</button>
				<button onClick={incrementPosts}>Add Post</button>
			</div>
		</div>
	);
}

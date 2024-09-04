<script>
	import { people, slots, getPeopleData, getSlotData } from '$lib';
	import { ProgressRadial } from '@skeletonlabs/skeleton';

	/** @type {import('./$types').PageData} */
	export let data;

	const infoScriptNum = 9;
	let w2mMeetingPromise;
	let w2mLink = '';

	const loadMeeting = async (meetingLink) => {
		if (w2mLink) {
			const meetingIDRegex = /\?(\d+-\w+)/g;
			let meetingID = meetingIDRegex.exec(meetingLink)[0];

			const htmlRes = await fetch(`/api/w2m/${meetingID}`);
			const html = await htmlRes.text();

			const parser = new DOMParser();
			const dom = parser.parseFromString(html, 'text/html');
			const scriptContent = dom.scripts[infoScriptNum].innerHTML;

			$slots = getSlotData(scriptContent);
			$people = getPeopleData(scriptContent, $slots);
		}
	};
</script>

<form
	class="input-group md:grid-cols-[auto_1fr_auto] border-2 border-primary-500"
	on:submit={(e) => {
		e.preventDefault();
		w2mMeetingPromise = loadMeeting(w2mLink);
	}}
>
	<label for="w2mLink" class="input-group-shim content-center p-4">When2Meet Link</label>
	<input
		id="w2mLink"
		name="w2mLink"
		type="text"
		class="input p-4"
		placeholder="https://www.when2meet.com/..."
		required
		bind:value={w2mLink}
	/>
	<button class="btn variant-filled-primary w-full" type="submit" disabled={!w2mLink}
		>Load Meeting</button
	>
</form>

<div class="h-[calc(100vh-214px)] md:h-[calc(100vh-116px)] md:flex justify-center items-center">
	{#if w2mMeetingPromise}
		{#await w2mMeetingPromise}
			<div class="w-full h-full flex justify-center items-center">
				<ProgressRadial width="w-24" />
			</div>
		{:then res}
			<div class="container card p-4 flex flex-col md:flex-row gap-8">
				<div>
					<h2 class="text-xl font-bold mb-4">Select group:</h2>
					<form action="">
						<ul class="space-y-4">
							{#each $people as person}
								<li>
									<label class="flex items-center space-x-2">
										<input type="checkbox" class="checkbox scale-125" />
										<p class="text-lg">{person.name}</p>
									</label>
								</li>
							{/each}
						</ul>
						<button type="submit" class="btn variant-filled-primary mt-4">Find Overlap</button>
					</form>
				</div>
				<span class="hidden md:block divider-vertical" />
				<hr />
				<div class="flex-grow"></div>
			</div>
		{:catch error}
			<p class="text-red-500">{error.message}</p>
		{/await}
	{:else}
		<div class="w-full h-full flex justify-center items-center">
			<p>No meeting loaded...</p>
		</div>
	{/if}
</div>

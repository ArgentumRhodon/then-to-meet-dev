<script>
	import { people, slots, getPeopleData, getSlotData } from '$lib';
	import { ProgressRadial } from '@skeletonlabs/skeleton';

	/** @type {import('./$types').PageData} */
	export let data;

	const infoScriptNum = 9;
	let w2mMeetingPromise;
	let w2mLink = 'https://www.when2meet.com/?25478485-BiFSz';

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

<div
	class="md:flex justify-center items-center min-h-[calc(100vh-214px)] md:min-h-[calc(100vh-116px)]"
>
	{#if w2mMeetingPromise}
		{#await w2mMeetingPromise}
			<div class="w-full h-96 flex justify-center items-center">
				<ProgressRadial width="w-24" />
			</div>
		{:then res}
			<div class="w-full md:container card p-4 flex">
				<form action="">
					<span>Select group</span>
					<ul>
						{#each $people as person}
							<li>
								<label for="member">
									<input name="member" type="checkbox" class="checkbox scale-125" />
									<span>{person.name}</span>
								</label>
							</li>
						{/each}
					</ul>
					<button class="btn variant-filled-primary">Find Times</button>
				</form>
			</div>
		{:catch err}
			<div class="w-full h-96 flex justify-center items-center">
				<p>{err.message}</p>
			</div>
		{/await}
	{:else}
		<div class="w-full h-96 flex justify-center items-center">
			<p>No meeting loaded...</p>
		</div>
	{/if}
</div>

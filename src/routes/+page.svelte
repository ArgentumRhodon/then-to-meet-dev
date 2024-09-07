<script>
	import { people, slots, getPeopleData, getSlotData } from '$lib';
	import { ProgressRadial, TabGroup } from '@skeletonlabs/skeleton';
	import { DateTime } from 'luxon';

	/** @type {import('./$types').PageData} */
	export let data;

	const infoScriptNum = 9;
	let groupedSlots = {};
	let days = [];
	let selectedIDs = [];
	let w2mMeetingPromise;
	let w2mLink = 'https://www.when2meet.com/?25478485-BiFSz';

	$: console.log(selectedIDs);

	const formatDate = (unixTime) => {
		const date = DateTime.fromSeconds(unixTime);
		return date.year <= 1978
			? date.toFormat('cccc') // Full weekday name (e.g., "Monday")
			: date.toFormat('EEE, MMM dd'); // Short weekday, month, and day (e.g., "Mon, Sep 06")
	};

	const formatTime = (unixTime) => {
		const time = DateTime.fromSeconds(unixTime);
		return time.year <= 1978 ? time.toUTC().toFormat('hh:mm a') : time.toFormat('hh:mm a');
	};

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

			// Groups the slot data provided in $slots under specific days/dates
			groupedSlots = {};
			days = [];
			$slots.forEach((slot) => {
				const day = formatDate(slot.time);
				if (!groupedSlots[day]) {
					groupedSlots[day] = [];
					days.push(day);
				}
				groupedSlots[day].push(slot);
			});
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
			<div class="w-full md:container card p-4 flex flex-col md:flex-row">
				<form action="" class="space-y-4">
					<span class="text-xl">Select group</span>
					<ul class="space-y-2">
						{#each $people as person}
							<li>
								<label for="member" class="space-x-2">
									<input name="member" type="checkbox" class="checkbox scale-125" />
									<span class="text-lg">{person.name}</span>
								</label>
							</li>
						{/each}
					</ul>
				</form>
				<span class="divider-vertical hidden md:block mx-8"></span>
				<hr class="md:hidden my-8" />
				<div class="flex-grow overflow-scroll">
					<table class="table-auto w-full border-collapse">
						<thead>
							{#each days as day}
								<th class="border px-4 py-2">{day}</th>
							{/each}
						</thead>
						<tbody>
							{#each { length: groupedSlots[days[0]].length } as _, rowIndex}
								<tr>
									{#each days as day}
										<td class="border text-center">
											{formatTime(groupedSlots[day][rowIndex].time)}
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
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

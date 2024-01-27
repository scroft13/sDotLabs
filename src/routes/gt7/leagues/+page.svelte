<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  // @ts-ignore
  import Calendar from '@event-calendar/core';
  // @ts-ignore
  import DayGrid from '@event-calendar/day-grid';
  // @ts-ignore
  import TimeGrid from '@event-calendar/time-grid';
  import type { Events, PublicServerEvent } from '$lib/shared';
  import db from '$lib/db';
  import AddPublicEventModal from '$lib/components/AddPublicEventModal.svelte';

  // let plugins = [TimeGrid];
  // let options: { view: string; events: {}[] } = {
  //   view: 'timeGridWeek',
  //   events: [
  //     {
  //       id: 12,
  //       start: '2024-1-15 09:00:00',
  //       end: '2024-01-15 09:00:00',
  //       title: 'Event Test',
  //       display: 'auto',
  //     },
  //   ],
  // };
  let ec: Calendar;
  let openEventModal = false;
  let events: Events[] = [
    {
      id: 12,
      start: new Date('2024-1-22 09:00:00'),
      end: new Date('2024-01-22 10:30:00'),
      title: 'Weekly GT3 Weekly GT3 Weekly GT3 Weekly GT3',
      display: 'auto',
    },
    {
      id: 13,
      start: new Date('2024-1-23 10:00:00 GMT-0200'),
      end: new Date('2024-01-23 11:00:00 GMT-0200'),
      title: 'Event Test',
      display: 'auto',
    },
  ];
  onMount(async () => {
    await db.publicEventsList.all().then((eventList) => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      if (eventList) {
        events = eventList.map((publicEvent: PublicServerEvent) => {
          const formattedDateString = publicEvent.start_date.toLocaleString('en-US', {
              timeZone: timezone,
            }),
            endDateTime = new Date(publicEvent.start_date);
          endDateTime.setHours(endDateTime.getHours() + publicEvent.duration_hrs);
          const modifiedDateString = endDateTime.toString();
          return {
            id: publicEvent.id,
            start: new Date(formattedDateString),
            end: new Date(modifiedDateString),
            title: publicEvent.title,
          };
        });
      }
    });
    ec = new Calendar({
      target: browser && document.getElementById('ec'),
      props: {
        plugins: [DayGrid, TimeGrid],
        options: {
          view: 'timeGridWeek',
          events: events,
          headerToolbar: {
            start: 'dayGridMonth,timeGridWeek,timeGridDay',
            center: 'title',
            end: 'today prev,next',
          },
        },
      },
    });
  });
  // export let eventsa = [];

  // // Function to group events by date
  // const groupEventsByDate = () => {
  //   const groupedEvents = {};
  //   eventsa.forEach((event) => {
  //     const date: string = new Date(event.date).toDateString();
  //     if (!groupedEvents[date]) {
  //       groupedEvents[date] = [];
  //     }
  //     groupedEvents[date].push(event);
  //   });
  //   return groupedEvents;
  // };

  // $: groupedEvents = groupEventsByDate();

  async function launchAddEvent() {
    openEventModal = true;
  }
</script>

{#if openEventModal}
  <AddPublicEventModal
    open={openEventModal}
    on:close={() => {
      openEventModal = false;
    }}
    leagueName="Test League"
  />
{/if}

<div id="ec" class="mx-4 h-[80vh] overflow-auto" />
<div class="flex gap-4">
  <button on:click={() => launchAddEvent()} class="btn-primary">Add Event</button>
  <button on:click={() => launchAddEvent()} class="submit-button">Add Events</button>
</div>
<!-- 
<div class="calendar">
  {#each Object.keys(groupedEvents) as date}
    <div class="date">
      <h2>{date}</h2>
      {#each groupedEvents[date] as event}
        <div class="event">
          <p>{event.title}</p>
        </div>
      {/each}
    </div>
  {/each}
</div> -->

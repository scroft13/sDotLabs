<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import Calendar from '@event-calendar/core';
  import DayGrid from '@event-calendar/day-grid';
  import TimeGrid from '@event-calendar/time-grid';
  import type { Events } from '$lib/shared';

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
  let events: Events[] = [
    {
      id: 12,
      start: new Date('2024-1-15 09:00:00'),
      end: new Date('2024-01-15 09:45:00'),
      title: 'Event Test',
      display: 'auto',
    },
    {
      id: 13,
      start: new Date('2024-1-15 10:00:00 GMT-0200'),
      end: new Date('2024-01-15 11:00:00 GMT-0200'),
      title: 'Event Test',
      display: 'auto',
    },
  ];
  onMount(() => {
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
</script>

<div id="ec" class="static" />

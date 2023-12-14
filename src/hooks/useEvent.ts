import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useJoin from "./useJoin";

export default function useEvent() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const handle = searchParams.get("handle");
  const { joinEvent } = useJoin();

  const postEvent = async ({
    // handle,
    eventname,
    starttime,
    endtime,
  }: {
    // handle: string;
    eventname: string;
    starttime: string;
    endtime: string;
  }) => {
    setLoading(true);

    // store new event in database
    const res = await fetch("/api/events", {
      method: "POST",
      body: JSON.stringify({
        handle,
        eventname,
        starttime,
        endtime,
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error);
    }

    // direct to new event page
    const response = await res.json();
    const event_id = response.event_id[0].id;
    router.push(`/event/${event_id}?${searchParams.toString()}`);

    await joinEvent({
      eventId: event_id,
      userHandle: handle??"",
    });

    setLoading(false);
  };

  return {
    postEvent,
    loading,
  };
}


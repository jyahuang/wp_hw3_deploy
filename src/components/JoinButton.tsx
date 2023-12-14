"use client";

import { useState } from "react";
import type { EventHandler, MouseEvent } from "react";
import { UserCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";

import useJoin from "@/hooks/useJoin";
import { cn } from "@/lib/utils";

type JoinButtonProps = {
  initialJoins: number;
  initialJoined?: boolean;
  eventId: number;

  isEventPage: boolean;
};

export default function JoinButton({
  initialJoins,
  initialJoined,
  eventId,
  // handle,
  isEventPage,
}: JoinButtonProps) {
  const searchParams = useSearchParams();
  const handle = searchParams.get("handle");
  const [joined, setJoined] = useState(initialJoined);
  const [joinsCount, setJoinsCount] = useState(initialJoins);
  const { joinEvent, nojoinEvent, loading } = useJoin();

  const handleClick: EventHandler<MouseEvent> = async () => {
    // since the parent node of the button is a Link, when we click on the
    // button, the Link will also be clicked, which will cause the page to
    // navigate to the tweet page, which is not what we want. So we stop the
    // event propagation and prevent the default behavior of the event.
    // e.stopPropagation();
    // e.preventDefault();
    // join's background is not a Link
    if (!handle) return;
    if (joined) {
      await nojoinEvent({
        eventId,
        userHandle: handle,
      });
      setJoinsCount((prev) => prev - 1);
      setJoined(false);
      // console.log("nojoin event");
      // console.log({ eventId, userHandle: handle, joinsCount });
    } else {
      await joinEvent({
        eventId,
        userHandle: handle,
      });
      setJoinsCount((prev) => prev + 1);
      setJoined(true);
    }
  };

  return (
    <>
      {!isEventPage ? (
        <div className="flex flex-row items-center right-0">
          {joined && <UserCheck size={20} />}
          <p className="float-right pl-2">{joinsCount} people joined</p>
        </div>
      ) : (
        <div className={cn(
          "flex flex-col w-32 h-32 items-center gap-1",
        )}>
          <button
            className={cn(
              "flex w-32 h-20 my-2 px-4 py-2 text-xl  rounded-md bg-gray-700 text-white hover:bg-gray-300 items-center justify-center",
              joined && "bg-gray-500",
            )}
            onClick={handleClick}
            disabled={loading}
          >
              <p>{joined && "Already Joined"}</p>
              <p>{!joined && "Join"}</p>
          </button>
          <p className="w-full break-words items-center text-gray-500">{joinsCount} people joined</p>
        </div> 
      )}
    </>
  );
}

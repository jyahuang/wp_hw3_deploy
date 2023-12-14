import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { getAvatar } from "@/lib/utils";

import JoinButton from "./JoinButton";
import TimeText from "./TimeText";

type EventProps = {
  username?: string;
  handle?: string;
  id: number;
  authorName: string;
  authorHandle: string;
  eventname: string;
  // event list page need not show starttime and endtime
  // starttime: string;
  // endtime: string;
  joins: number;
  joined?: boolean;
  createdAt: Date;
};

// note that the Tweet component is also a server component
// all client side things are abstracted away in other components
export default function Event({
  username,
  handle,
  id,
  authorName,
  authorHandle,
  eventname,
  joins,
  joined,
  createdAt,
}: EventProps) {
  
  return (
    <>
      <Link
        className="w-full px-4 pt-3 transition-colors hover:bg-gray-50"
        href={{
          pathname: `/event/${id}`,
          query: {
            username,
            handle,
          },
        }}
      >
        <div className="flex gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getAvatar(authorName)}
            alt="avatar"
            className="h-12 w-12 rounded-full"
          />
          <article className="flex grow flex-col">
            <p className="font-bold">
              {authorName}
              <span className="ml-2 font-normal text-gray-400">
                @{authorHandle}
              </span>
              <time className="ml-2 font-normal text-gray-400">
                <TimeText date={createdAt} format="h:mm A · D MMM YYYY" />
              </time>
            </p>
            {/* `white-space: pre-wrap` tells html to render \n and \t chracters  */}
            <div className="grid grid-cols-4 mb-2">
              <article className="col-span-3 my-2 whitespace-pre-wrap bg-gray-100 p-3 text-xl">{eventname}</article>
              <div className="col-span-1 my-2 mr-2 flex items-right justify-end gap-4 text-gray-500">
                <JoinButton
                  initialJoins={joins}
                  initialJoined={joined}
                  eventId={id}
                  // handle={handle}
                  isEventPage={false}
                />
              </div>
            </div>
          </article>
        </div>
      </Link>
      <Separator />
    </>
  );
}

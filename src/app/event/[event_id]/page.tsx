import Link from "next/link";
import { redirect } from "next/navigation";

import { eq, asc, and } from "drizzle-orm";
import {
  ArrowLeft,
  // MessageCircle,
  // MoreHorizontal,
  // Repeat2,
  // Share,
} from "lucide-react";

import ReplyInput from "@/components/ReplyInput";
import TimeText from "@/components/TimeText";
import Tweet from "@/components/Tweet";
import JoinButton from "@/components/JoinButton";
import { Separator } from "@/components/ui/separator";
import { db } from "@/db";
import { joinsTable, tweetsTable, eventsTable, usersTable } from "@/db/schema";
import { getAvatar } from "@/lib/utils";

type TweetPageProps = {
  params: {
    // this came from the file name: [event_id].tsx
    event_id: string;
  };
  searchParams: {
    // this came from the query string: ?username=madmaxieee
    username?: string;
    handle?: string;
  };
};

// these two fields are always available in the props object of a page component
export default async function TweetPage({
  params: { event_id },
  searchParams: { username, handle },
}: TweetPageProps) {
  // redirects to the home page when there is an error
  const errorRedirect = () => {
    const params = new URLSearchParams();
    username && params.set("username", username);
    handle && params.set("handle", handle);
    redirect(`/?${params.toString()}`);
  };

  // if the event_id can not be turned into a number, redirect to the home page
  const event_id_num = parseInt(event_id);
  if (isNaN(event_id_num)) {
    errorRedirect();
  }

  // This is the easiest way to get the event data
  // you can run separate queries for the event data, joins, and joined
  // and then combine them in javascript.
  //
  // This gets things done for now, but it's not the best way to do it
  // relational databases are highly optimized for this kind of thing
  // we should always try to do as much as possible in the database.

  // This piece of code runs the following SQL query on the tweets table:
  // SELECT
  //   id,
  //   content,
  //   user_handle,
  //   created_at
  //   FROM tweets
  //   WHERE id = {tweet_id_num};

    const [currentEvent] = await db
      .select({
        id: eventsTable.id,
        eventname: eventsTable.eventname,
        userHandle: eventsTable.userHandle,
        starttime: eventsTable.starttime,
        endtime: eventsTable.endtime,
        createdAt: eventsTable.createdAt,
      })
      .from(eventsTable)
      .where(eq(eventsTable.id, event_id_num))
      .execute();

  // Although typescript thinks tweetData is not undefined, it is possible
  // that tweetData is undefined. This can happen if the tweet doesn't exist.
  // Thus the destructuring assignment above is not safe. We need to check
  // if tweetData is undefined before using it.
  if (!currentEvent) {
    errorRedirect();
  }

  // This piece of code runs the following SQL query on the tweets table:
  // SELECT
  //  id,
  //  FROM likes
  //  WHERE tweet_id = {tweet_id_num};
  // Since we only need the number of likes, we don't actually need to select
  // the id here, we can select a constant 1 instead. Or even better, we can
  // use the count aggregate function to count the number of rows in the table.
  // This is what we do in the next code block in likesSubquery.
  const joins = await db
    .select({
      id: joinsTable.id,
    })
    .from(joinsTable)
    .where(eq(joinsTable.eventId, event_id_num))
    .execute();

  const numJoins = joins.length;

  const [joined] = await db
    .select({
      id: joinsTable.id,
    })
    .from(joinsTable)
    .where(
      and(
        eq(joinsTable.eventId, event_id_num),
        eq(joinsTable.userHandle, handle ?? ""),
      ),
    )
    .execute();

  // the author of the current event
  const [user] = await db
    .select({
      displayName: usersTable.displayName,
      handle: usersTable.handle,
    })
    .from(usersTable)
    .where(eq(usersTable.handle, currentEvent.userHandle))
    .execute();

  const event = {
    id: event_id_num,
    // this is author's handle and username
    username: user.displayName,
    handle: user.handle,
    eventname: currentEvent.eventname,
    starttime: currentEvent.starttime,
    endtime: currentEvent.endtime,
    joins: numJoins,
    joined: Boolean(joined),
    createdAt: currentEvent.createdAt,
  }

  const replies = await db
    .select({
      id: tweetsTable.id,
      content: tweetsTable.content,
      username: usersTable.displayName,
      handle: usersTable.handle,
      createdAt: tweetsTable.createdAt,
    })
    .from(tweetsTable,)
    .where(eq(tweetsTable.replyToEventId, event_id_num))
    .orderBy(asc(tweetsTable.createdAt))
    .innerJoin(usersTable, eq(tweetsTable.userHandle, usersTable.handle))
    .execute();

  return (
    <>
      <div className="flex h-screen w-full flex-col overflow-scroll pt-2">
        <div className="mb-2 flex items-center gap-8 px-4">
          <Link href={{ pathname: "/", query: { username, handle } }}>
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold">Event</h1>
        </div>
        <div className="flex flex-col px-4 pt-3">
          <div className="grid grid-cols-4">
            <div className="col-span-3 flex flex-col justify-between gap-2">
              <div className="flex flex-row w-full gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getAvatar(event.username)}
                  alt="user avatar"
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <p className="font-bold">{event.username ?? "..."}</p>
                  <p className="font-normal text-gray-500">
                    @{event.handle ?? "..."}
                  </p>
                </div>
              </div>
              <article className="flex w-full mt-1 whitespace-pre-wrap text-2xl bg-gray-100 p-4 items-center">
                <p className="break-words">{event.eventname}</p>
              </article>
              <div className="col-span-3">
                <p className="font-normal text-gray-500 text-lg">
                  Duration: {event.starttime}:00 - {event.endtime}:00
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end align-bottom h-fit px-4">
              <JoinButton
                initialJoins={event.joins}
                initialJoined={event.joined}
                eventId={event.id}

                isEventPage={true}
              />
            </div>
          </div>
          <time className="my-2 block text-sm text-gray-500">
            <TimeText date={event.createdAt} format="h:mm A · D MMM YYYY" />
          </time>
          <Separator />
 
        </div>
        <ReplyInput 
          replyToEventId={event.id} 
          joined={event.joined} />
        <Separator />
        {replies.map((reply) => (
          <Tweet
            key={reply.id}
            authorName={reply.username}
            authorHandle={reply.handle}
            content={reply.content}
            createdAt={reply.createdAt!}
          />
        ))}
      </div>
    </>
  );
}

import { eq, desc, sql, like } from "drizzle-orm";

import NameDialog from "@/components/NameDialog";
import Event from "@/components/Event";
import NewEventButton from "@/components/NewEventButton";
import SearchBar from "@/components/SearchBar";
// import TweetInput from "@/components/TweetInput";
import { Separator } from "@/components/ui/separator";
import { db } from "@/db";
import { joinsTable, eventsTable, usersTable } from "@/db/schema";

type HomePageProps = {
  searchParams: {
    username?: string;
    handle?: string;
    searchTerm?: string;
  };
};

// Since this is a server component, we can do some server side processing
// in the react component. This may seem crazy at first, but it's actually
// a very powerful feature. It allows us to do the data fetching and rendering
// the page in the same place. It may seem weird to run react code on the server,
// but remember, react is not just for the browser, react-dom is. React is just
// the shadow dom and state update logic. We can use react to render anything,
// any where. There are already libraries that use react to render to the terminal,
// email, PDFs, native mobile apps, 3D objects and even videos.
export default async function Home({
  searchParams: { username, handle, searchTerm },
}: HomePageProps) {
  // read the username and handle from the query params and insert the user
  // if needed.
  if (username && handle) {
    await db
      .insert(usersTable)
      .values({
        displayName: username,
        handle,
      })
      // Since handle is a unique column, we need to handle the case
      // where the user already exists. We can do this with onConflictDoUpdate
      // If the user already exists, we just update the display name
      // This way we don't have to worry about checking if the user exists
      // before inserting them.
      .onConflictDoUpdate({
        target: usersTable.handle,
        set: {
          displayName: username,
        },
      })
      .execute();
  }

  // This is a good example of using subqueries, joins, and with statements
  // to get the data we need in a single query. This is a more complicated
  // query, go to src/app/tweet/[tweet_id]/page.tsx to see a simpler example.
  //
  // This is much more efficient than running separate queries for tweets,
  // likes, and liked, and then combining them in javascript. Not only is
  // the data processing done in the database, but we also only need to
  // make a single request to the database instead of three.

  // WITH clause is used to create a temporary table that can be used in the
  // main query. This is useful for creating subqueries that are used multiple
  // times in the main query. Or just to make the main query more readable.
  // read more about it here: https://orm.drizzle.team/docs/select#with-clause
  // If you're familiar with CTEs in SQL, watch this video:
  // https://planetscale.com/learn/courses/mysql-for-developers/queries/common-table-expressions-ctes
  //
  // This subquery generates the following SQL:
  // WITH likes_count AS (
  //  SELECT
  //   tweet_id,
  //   count(*) AS likes
  //   FROM likes
  //   GROUP BY tweet_id
  // )
  const joinsSubquery = db.$with("joins_count").as(
    db
      .select({
        eventId: joinsTable.eventId,
        // some times we need to do some custom logic in sql
        // although drizzle-orm is very powerful, it doesn't support every possible
        // SQL query. In these cases, we can use the sql template literal tag
        // to write raw SQL queries.
        // read more about it here: https://orm.drizzle.team/docs/sql
        joins: sql<number | null>`count(*)`.mapWith(Number).as("joins"),
      })
      .from(joinsTable)
      .groupBy(joinsTable.eventId),
  );

  // seartch bar!!!
  // This subquery generates the following SQL:
  // WITH liked AS (
  //  SELECT
  //   tweet_id,
  //   1 AS liked
  //   FROM likes
  //   WHERE user_handle = {handle}
  //  )
  const joinedSubquery = db.$with("joined").as(
    db
      .select({
        eventId: joinsTable.eventId,
        // this is a way to make a boolean column (kind of) in SQL
        // so when this column is joined with the tweets table, we will
        // get a constant 1 if the user joined the event, and null otherwise
        // we can then use the mapWith(Boolean) function to convert the
        // constant 1 to true, and null to false
        joined: sql<number>`1`.mapWith(Boolean).as("joined"),
      })
      .from(joinsTable)
      .where(eq(joinsTable.userHandle, handle ?? "")),
  );

  const events = await db
    .with(joinsSubquery, joinedSubquery)
    .select({
      id: eventsTable.id,
      eventname: eventsTable.eventname,
      username: usersTable.displayName,
      handle: usersTable.handle,
      joins: joinsSubquery.joins,
      joined: joinedSubquery.joined,
      createdAt: eventsTable.createdAt,
    })
    .from(eventsTable)
    // .where(isNull(eventtsTable.replyToTweetId))
    .orderBy(desc(eventsTable.createdAt))
    // JOIN is by far the most powerful feature of relational databases
    // it allows us to combine data from multiple tables into a single query
    // read more about it here: https://orm.drizzle.team/docs/select#join
    // or watch this video:
    // https://planetscale.com/learn/courses/mysql-for-developers/queries/an-overview-of-joins
    .innerJoin(usersTable, eq(eventsTable.userHandle, usersTable.handle))
    .leftJoin(joinsSubquery, eq(eventsTable.id, joinsSubquery.eventId))
    .leftJoin(joinedSubquery, eq(eventsTable.id, joinedSubquery.eventId))
    .where(like(eventsTable.eventname, `%${searchTerm}%`))
    .execute();

  return (
    <>
      <div className="flex h-screen w-full flex-col overflow-scroll pt-2">
        <Separator />
        <div className="flex items-center grid grid-cols-5 w-full px-4 pt-3 h-16 mb-3 gap-4">
          <div className="flex justify-start items-left col-span-4">
            <SearchBar />
          </div>
          <div className="flex justify-end col-span-1 mx-2">
            <NewEventButton />
          </div>
        </div>
        <Separator />
        {events.map((event) => (
          <Event
            key={event.id}
            id={event.id}
            username={username}
            handle={handle}
            authorName={event.username}
            authorHandle={event.handle}
            eventname={event.eventname}
            joins={event.joins??0}
            joined={event.joined??false}
            createdAt={event.createdAt!}
          />
        ))}
      </div>
      <NameDialog />
    </>
  );
}

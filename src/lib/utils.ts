import { faker } from "@faker-js/faker";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// this utility function is used to merge tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// generate a random avatar for a user
export function getAvatar(username?: string | null) {
  faker.seed(username ? getSeed(username) : 42069);
  return faker.internet.avatar();
}

// convert username to a number for consistent seeding
function getSeed(username: string) {
  const code = new TextEncoder().encode(username);
  return Array.from(code).reduce(
    (acc, curr, i) => (acc + curr * i) % 1_000_000,
    0,
  );
}

export function validateHandle(handle?: string | null) {
  if (!handle) return false;
  return /^[a-z0-9\\._-]{1,25}$/.test(handle);
}

export function validateUsername(username?: string | null) {
  if (!username) return false;
  return /^[a-zA-Z0-9 ]{1,50}$/.test(username);
}

export function validateEventname(eventname?: string | null) {
  if (!eventname) return false;
  return /^[\s\S]{1,50}$/.test(eventname);
}

export function validateEventtime(starttime?: string | null, endtime?: string | null) {
  if (!endtime || !starttime) {
  console.log("Missing start or end time");
  return false;
}

  const starttimeTimestamp = new Date(starttime + ":").getTime();
  const endtimeTimestamp = new Date(endtime + ":").getTime();
  if (isNaN(starttimeTimestamp) || isNaN(endtimeTimestamp)) {
    console.log("Invalid start or end time");
    return false;
  }

  if (endtimeTimestamp <= starttimeTimestamp) {
    console.log("End time is before start time");
    return false;
  }
  if (endtimeTimestamp - starttimeTimestamp > 7 * 24 * 60 * 60 * 1000) {
    console.log("Event duration is too long");
    return false;
  }
  return true;
}

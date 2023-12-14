"use client";

import { useRouter } from "next/navigation";

import { Users } from "lucide-react";

import UserAvatar from "@/components/UserAvatar";
import useUserInfo from "@/hooks/useUserInfo";

export default function ProfileButton() {
  const { username, handle } = useUserInfo();
  const router = useRouter();

  return (
    <div
      className="flex items-center w-[800px] gap-4 mt-4 mb-2 p-3 text-start"
      // go to home page without any query params to allow the user to change their username and handle
      // see src/components/NameDialog.tsx for more details
    >
      <UserAvatar />
      <div className="w-40">
        <p className="text-md font-bold py-1">{username ?? "..."}</p>
        <p className="text-md text-gray-500">{`@${handle}`}</p>
      </div>
      <div className="ml-auto rounded-full p-3 transition-colors duration-300 hover:bg-gray-200">
      <button  onClick={() => router.push("/")}>
        <Users size={24} />
      </button>
      </div>
    </div>
  );
}

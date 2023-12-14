"use client";

import { useRef, useEffect } from "react";

import GrowingTextarea from "@/components/GrowingTextarea";
import UserAvatar from "@/components/UserAvatar";
import useTweet from "@/hooks/useTweet";
import useUserInfo from "@/hooks/useUserInfo";
// import { cn } from "@/lib/utils";

type ReplyInputProps = {
  replyToEventId: number;
  joined: boolean;
  // replyToHandle: string;
};

export default function ReplyInput({ replyToEventId, joined, }: ReplyInputProps) {
  const { handle } = useUserInfo();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { postTweet, loading } = useTweet();

  useEffect(() => {
    // clean the textarea when the user joins or retreats the event
    if (textareaRef.current) textareaRef.current.value = "";
  }, [joined]);

  const handleKeyPress = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault(); // Prevent the default newline behavior

    const content = textareaRef.current?.value;
    if (!content) return;
    if (!handle) return;

    try {
      await postTweet({
        handle,
        content,
        replyToEventId,
      });
      textareaRef.current.value = "";
      // this triggers the onInput event on the growing textarea
      // thus triggering the resize
      // for more info, see: https://developer.mozilla.org/en-US/docs/Web/API/Event
      textareaRef.current.dispatchEvent(
        new Event("input", { bubbles: true, composed: true }),
      );
    } catch (e) {
      console.error(e);
      alert("Error posting reply");
    }
  };

  return (
    // this allows us to focus (put the cursor in) the textarea when the user
    // clicks anywhere on the div
    <div className="flex m-4" onClick={() => textareaRef.current?.focus()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
      <UserAvatar className="h-12 w-12" />
      <div className="flex w-[680px] flex-col px-4">
        <div className="my-2">
          <GrowingTextarea
            ref={textareaRef}
            disabled={loading || !joined}
            className="bg-transparent text-xl outline-none placeholder:text-gray-500 break-words w-[680px]"
            placeholder={joined?("Say something..."):("Join the event to discuss with others.")}
            onKeyPress={handleKeyPress}
            />
        </div>
      </div>
    </div>
  );
}

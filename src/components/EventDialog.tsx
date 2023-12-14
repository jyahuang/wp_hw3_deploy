"use client";

import * as React from "react";
import { useRef, useState, useEffect } from "react";

// all components is src/components/ui are lifted from shadcn/ui
// this is a good set of components built on top of tailwindcss
// see how to use it here: https://ui.shadcn.com/
import { Button } from "@/components/ui/button";
import useEvent from "@/hooks/useEvent";
// import useUserInfo from "@/hooks/useUserInfo";
import {
  Dialog,
  DialogContent,
} from "@mui/material";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, validateEventname, validateEventtime } from "@/lib/utils";

type EventDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function EventDialog({open, onClose}: EventDialogProps) {
  const eventnameInputRef = useRef<HTMLInputElement>(null);
  const starttimeInputRef = useRef<HTMLInputElement>(null);
  const endtimeInputRef = useRef<HTMLInputElement>(null);
  const { postEvent, loading } = useEvent();
  const [eventnameError, setEventnameError] = useState(false);
  const [eventtimeError, setEventtimeError] = useState(false);

  // check if the username and handle are valid when the component mounts
  // only show the dialog if the username or handle is invalid
  useEffect(() => {
    setEventnameError(false);
    setEventtimeError(false);
  }, [open]);

  // handleSave modifies the query params to set the username and handle
  // we get from the input fields. src/app/page.tsx will read the query params
  // and insert the user into the database.
  const handleSave = async () => {
    console.log("Add event button clicked");
    
    const eventname = eventnameInputRef.current?.value;
    const starttime = starttimeInputRef.current?.value;
    const endtime = endtimeInputRef.current?.value;
    
    const newEventnameError = !validateEventname(eventname);
    setEventnameError(newEventnameError);
    const newEventtimeError = !validateEventtime(starttime, endtime);
    setEventtimeError(newEventtimeError);
    if (newEventnameError || newEventtimeError) {
      return;
    }
    
    if (!eventname || !starttime || !endtime) return;
    console.log("ready to post event");
    
    try {
      await postEvent({
        // handle,
        eventname,
        starttime,
        endtime,
      });
      console.log("Event posted.")
      console.log({ eventname, starttime, endtime });

      onClose();
    } catch (e) {
      console.error(e);
      alert("Error:  cannot add new event.");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} >
      <DialogContent className="sm:max-w-[550px]">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-2 mx-2">
              <Label htmlFor="eventname" className="text-right cols-start-1 mr-2 text-lg">
                Event Name
              </Label>
              <Input
                placeholder="event name"
                // defaultValue={searchParams.get("eventname") ?? ""}
                className={cn(eventnameError && "border-red-500", "col-span-3", "col-start-2", "pr-4", "items-center")}
                ref={eventnameInputRef}
              />
              {eventnameError && (
                <p className="col-span-3 col-start-2 text-xs text-red-500">
                  Invalid event name. Please enter a valid event name under 50 words.
                </p>
              )}
            </div>
            <div className="grid grid-row-2 items-center gap-2">
              <div className="grid row-start-1 grid-cols-4 items-center gap-2 mb-2">
                <div className="col-start-1 col-span-2 items-center mx-2 mt-2">
                  <Label htmlFor="starttime" className="text-left text-base">
                    From
                  </Label>
                  <div className="col-span-3 flex items-center mt-2">
                    <Input
                      placeholder="start time"
                      // defaultValue={searchParams.get("starttime") ?? ""}
                      className={cn(eventtimeError && "border-red-500", "col-span-3", "col-start-2", "pr-4", "items-center")}
                      ref={starttimeInputRef}
                    />
                  </div>
                </div>
                <div className="col-start-3 col-span-2 items-center mx-2 mt-2">
                  <Label htmlFor="endtime" className="text-left text-base">
                    To
                  </Label>
                  <div className="col-span-3 flex items-center mt-2">
                    <Input
                      placeholder="end time"
                      // defaultValue={searchParams.get("endtime") ?? ""}
                      className={cn(eventtimeError && "border-red-500", "col-span-3", "col-start-2", "pr-4", "items-center")}
                      ref={endtimeInputRef}
                    />
                  </div>
                </div>
                <div className="w-full row-start-2 col-span-4 mx-2 items-center">
                    <p className="col-span-3 text-xs">
                      Please enter in the form of "YYYY/MM/DD HH" (e.g. 2023/11/02 23).
                    </p>
                </div>
                <div className="w-full row-start-3 col-span-4 mx-2 items-center">
                  {eventtimeError && (
                    <p className="col-span-3 text-xs text-red-500">
                      Invalid time. Please enter the start time and end time, and make sure the duration is at least 1 hour and at most 7 days.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Button onClick={handleSave} disabled={loading}>Add</Button>
          </div>
      </DialogContent>
    </Dialog>
  );
}

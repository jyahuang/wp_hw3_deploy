"use client";

import { useState } from "react";
import EventDialog from "./EventDialog";
import { Button } from "@/components/ui/button";

export default function NewEventButton() {
  const [ openNewEventDialog, setOpenNewEventDialog ] = useState(false);

  const handleClick = () => {
    console.log("New Event Button Clicked");
    setOpenNewEventDialog(true);
  }

  return(
    <>
      <Button className="text-md" onClick={handleClick}>
        Add Event
      </Button>
      <EventDialog 
        open={openNewEventDialog}
        onClose={()=>setOpenNewEventDialog(false)}
      />
    </>
  );
}
"use client";

import { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";  
import { Search } from "lucide-react";

export default function NewEventButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTermInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchTermInputRef.current) {
      searchTermInputRef.current.value = "";
      const param = new URLSearchParams(searchParams);
      param.set("searchTerm", "")
      router.push(`/?${param.toString()}`);
    }
  }, []);

  const handleSearch = () => {
    const searchTerm = searchTermInputRef.current?.value;
    const params = new URLSearchParams(searchParams);
    if (!searchTerm) {
      // Clear the searchTerm parameter from the URL when the input is empty
      params.set("searchTerm", "");
    } else {
      // Update the URL with the new searchTerm
      params.set("searchTerm", searchTerm!);
    }
    router.push(`/?${params.toString()}`);
  }

  return(
    <>
      <div className="flex flex-row gap-2 items-center">
        <Search size={20} className="mx-2"/>
        <Input
          className="text-md"
          placeholder="Search"
          defaultValue={searchParams.get("searchTerm") ?? ""}
          ref={searchTermInputRef}
          onChange={handleSearch}
        />
      </div>
    </>
  );
}
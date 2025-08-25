import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useCompanies } from "../../hooks/useCompanies";

interface CompanySearchProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CompanySearch({
  value,
  onValueChange,
  placeholder = "Search company...",
  className,
}: CompanySearchProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { companies, fetchCompanies, loading } = useCompanies();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSelect = (currentValue: string) => {
    onValueChange(currentValue);
    setOpen(false);
    setSearchValue("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearchValue(inputValue);

    // If user types something new, allow custom input
    if (
      inputValue &&
      !companies.some(
        (company) => company.name.toLowerCase() === inputValue.toLowerCase()
      )
    ) {
      onValueChange(inputValue);
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className
          )}
        >
          {value ? (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {value}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {placeholder}
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            ref={inputRef}
            placeholder={placeholder}
            value={searchValue}
            onValueChange={setSearchValue}
            onInput={handleInputChange}
          />
          <CommandList>
            <CommandEmpty>
              {searchValue ? (
                <div className="p-2 text-sm text-muted-foreground">
                  Press Enter to add "{searchValue}" as a new company
                </div>
              ) : (
                <div className="p-2 text-sm text-muted-foreground">
                  No companies found.
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredCompanies.map((company) => (
                <CommandItem
                  key={company._id}
                  value={company.name}
                  onSelect={() => handleSelect(company.name)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === company.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {company.name}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {company.totalStudents} students
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

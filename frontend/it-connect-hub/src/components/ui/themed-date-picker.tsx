import { CalendarDays, Check, Clock } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PickerMode = "date" | "datetime";

interface ThemedDatePickerProps {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  mode?: PickerMode;
  disabled?: boolean;
  className?: string;
}

const hours = Array.from({ length: 24 }, (_, index) => index.toString().padStart(2, "0"));
const minutes = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, "0"));

function parsePickerValue(value?: string) {
  if (!value) return { date: undefined, hour: "17", minute: "00" };

  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);

  if (!year || !month || !day) return { date: undefined, hour: "17", minute: "00" };

  const [hour = "17", minute = "00"] = (timePart ?? "").split(":");

  return {
    date: new Date(year, month - 1, day),
    hour: hour.padStart(2, "0"),
    minute: minute.padStart(2, "0"),
  };
}

function toDateValue(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function toDateTimeValue(date: Date, hour: string, minute: string) {
  return `${toDateValue(date)}T${hour}:${minute}`;
}

export function ThemedDatePicker({
  id,
  value,
  onChange,
  placeholder = "Select date",
  mode = "date",
  disabled,
  className,
}: ThemedDatePickerProps) {
  const { date, hour, minute } = parsePickerValue(value);
  const minuteOptions = minutes.includes(minute) ? minutes : [...minutes, minute].sort();
  const hasValue = Boolean(date);
  const triggerLabel = date
    ? mode === "datetime"
      ? `${format(date, "MMM d, yyyy")} at ${hour}:${minute}`
      : format(date, "MMM d, yyyy")
    : placeholder;

  const updateDate = (nextDate?: Date) => {
    if (!nextDate) return;
    onChange(mode === "datetime" ? toDateTimeValue(nextDate, hour, minute) : toDateValue(nextDate));
  };

  const updateHour = (nextHour: string) => {
    if (!date) return;
    onChange(toDateTimeValue(date, nextHour, minute));
  };

  const updateMinute = (nextMinute: string) => {
    if (!date) return;
    onChange(toDateTimeValue(date, hour, nextMinute));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-start rounded-xl border-2 bg-card/70 px-3 text-left font-normal tracking-normal hover:border-primary/40",
            !hasValue && "text-muted-foreground",
            className,
          )}
        >
          <CalendarDays className="h-4 w-4 text-primary" />
          <span className="min-w-0 flex-1 truncate">{triggerLabel}</span>
          {hasValue ? <Check className="h-4 w-4 text-primary" /> : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-2xl border-2 border-primary/20 bg-card/95 p-0 shadow-2xl shadow-primary/10">
        <div className="border-b border-border/70 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">{mode === "datetime" ? "Choose deadline" : "Choose date"}</p>
          <p className="text-xs text-muted-foreground">Pick from the calendar below.</p>
        </div>
        <Calendar mode="single" selected={date} onSelect={updateDate} initialFocus className="rounded-none" />
        {mode === "datetime" ? (
          <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-2 border-t border-border/70 p-4">
            <Clock className="h-4 w-4 text-primary" />
            <Select value={hour} onValueChange={updateHour} disabled={!date}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent>
                {hours.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={minute} onValueChange={updateMinute} disabled={!date}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Min" />
              </SelectTrigger>
              <SelectContent>
                {minuteOptions.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

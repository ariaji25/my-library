"use client";

import { format } from "date-fns";
import { addReadingLog } from "@/lib/actions";
import { useLocale } from "@/components/locale-provider";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  bookId: string;
};

export function ReadingLogForm({ bookId }: Props) {
  const { messages: m } = useLocale();
  const today = format(new Date(), "yyyy-MM-dd");
  const action = addReadingLog.bind(null, bookId);

  return (
    <ActionForm
      action={action}
      successMessage={m.toast.added}
      className="grid gap-4 rounded-2xl border border-border/80 p-4 sm:grid-cols-2"
    >
      <div className="space-y-2">
        <Label htmlFor="reading-date">{m.common.date}</Label>
        <Input
          id="reading-date"
          name="date"
          type="date"
          defaultValue={today}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pagesRead">{m.reading.pagesRead}</Label>
        <Input
          id="pagesRead"
          name="pagesRead"
          type="number"
          min={1}
          placeholder={`${m.common.example} 25`}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="minutesRead">{m.reading.readingTimeMinutes}</Label>
        <Input
          id="minutesRead"
          name="minutesRead"
          type="number"
          min={1}
          placeholder={`${m.common.example} 45`}
          required
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="quoteOfTheDay">{m.reading.quoteOfDay}</Label>
        <Textarea
          id="quoteOfTheDay"
          name="quoteOfTheDay"
          rows={2}
          placeholder={m.reading.quotePlaceholder}
        />
      </div>
      <SubmitButton className="sm:col-span-2 sm:w-fit">
        {m.bookForm.logReading}
      </SubmitButton>
    </ActionForm>
  );
}

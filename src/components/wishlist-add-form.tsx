"use client";

import { createWishlistItem } from "@/lib/actions";
import { WISHLIST_PRIORITY_VALUES } from "@/lib/constants";
import { priorityLabel } from "@/lib/i18n";
import { useLocale } from "@/components/locale-provider";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function WishlistAddForm() {
  const { messages: m } = useLocale();

  return (
    <ActionForm
      action={createWishlistItem}
      successMessage={m.toast.added}
      className="grid gap-4 md:grid-cols-2"
    >
      <div className="space-y-2">
        <Label htmlFor="title">
          {m.common.title} {m.common.required}
        </Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="author">
          {m.common.author} {m.common.required}
        </Label>
        <Input id="author" name="author" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="priority">{m.common.priority}</Label>
        <select
          id="priority"
          name="priority"
          className="flex h-9 w-full rounded-full border border-border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
          defaultValue="MEDIUM"
        >
          {WISHLIST_PRIORITY_VALUES.map((value) => (
            <option key={value} value={value}>
              {priorityLabel(value, m)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="notes">{m.common.notes}</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>
      <SubmitButton>{m.wishlist.addBook}</SubmitButton>
    </ActionForm>
  );
}

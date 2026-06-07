"use client";

import { createCollection } from "@/lib/actions";
import { useLocale } from "@/components/locale-provider";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreateCollectionForm() {
  const { messages: m } = useLocale();

  return (
    <ActionForm
      action={createCollection}
      successMessage={m.toast.added}
      className="space-y-4 max-w-md"
    >
      <div className="space-y-2">
        <Label htmlFor="name">
          {m.common.name} {m.common.required}
        </Label>
        <Input
          id="name"
          name="name"
          required
          placeholder={m.collections.namePlaceholder}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">{m.common.description}</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>
      <SubmitButton pendingLabel={m.common.saving}>
        {m.collections.create}
      </SubmitButton>
    </ActionForm>
  );
}

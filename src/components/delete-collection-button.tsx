"use client";

import { Trash2 } from "lucide-react";
import { deleteCollection } from "@/lib/actions";
import { useLocale } from "@/components/locale-provider";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";

type Props = {
  collectionId: string;
};

export function DeleteCollectionButton({ collectionId }: Props) {
  const { messages: m } = useLocale();
  const action = deleteCollection.bind(null, collectionId);

  return (
    <ActionForm action={action} successMessage={m.toast.deleted}>
      <SubmitButton variant="destructive">
        <Trash2 className="h-4 w-4" />
        {m.collections.delete}
      </SubmitButton>
    </ActionForm>
  );
}

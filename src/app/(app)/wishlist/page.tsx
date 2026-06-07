import { getWishlistItems } from "@/lib/queries";
import { priorityLabel } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n/server";
import { WishlistAddForm } from "@/components/wishlist-add-form";
import { DeleteWishlistButton } from "@/components/delete-wishlist-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const priorityVariant = {
  HIGH: "warning" as const,
  MEDIUM: "default" as const,
  LOW: "secondary" as const,
};

export default async function WishlistPage() {
  const { messages: m } = await getTranslations();
  const items = await getWishlistItems();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          {m.wishlist.title}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground sm:mt-1 sm:text-base">
          {m.wishlist.subtitle}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{m.wishlist.addTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <WishlistAddForm />
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {m.wishlist.empty}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-start justify-between gap-4 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{item.title}</h3>
                    <Badge variant={priorityVariant[item.priority]}>
                      {priorityLabel(item.priority, m)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.author}
                  </p>
                  {item.notes && (
                    <p className="mt-3 text-sm leading-relaxed">{item.notes}</p>
                  )}
                </div>
                <DeleteWishlistButton itemId={item.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

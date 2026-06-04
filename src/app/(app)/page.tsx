import Link from "next/link";
import { format } from "date-fns";
import {
  BookCheck,
  BookOpen,
  BookPlus,
  Bookmark,
  Library,
} from "lucide-react";
import { getDashboardStats } from "@/lib/queries";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GenreChart } from "@/components/genre-chart";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/10 p-5 shadow-sm shadow-primary/10 sm:p-8 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary sm:text-sm">
          Welcome back ✨
        </p>
        <h1 className="font-heading mt-2 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
          Your cozy reading nook
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:mt-3 sm:text-base">
          Track what you read, save what you love, and revisit the ideas that
          stayed with you.
        </p>
        <Link
          href="/library/new"
          className="mt-5 inline-flex h-9 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 sm:mt-6"
        >
          <BookPlus className="h-4 w-4" />
          Add a book
        </Link>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard label="Total Books" value={stats.total} icon={Library} />
        <StatCard label="Read" value={stats.read} icon={BookCheck} />
        <StatCard
          label="Currently Reading"
          value={stats.reading}
          icon={BookOpen}
        />
        <StatCard label="Unread" value={stats.unread} icon={BookPlus} />
        <StatCard
          label="Wishlist"
          value={stats.wishlistBooks + stats.wishlistCount}
          icon={Bookmark}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reading progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <span className="text-4xl font-semibold tabular-nums">
                {stats.completedPct}%
              </span>
              <span className="text-sm text-muted-foreground">
                {stats.read} of {stats.total} completed
              </span>
            </div>
            <Progress value={stats.completedPct} className="h-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Genre distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <GenreChart data={stats.genreDistribution} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:gap-6 md:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Last added
            </p>
            {stats.lastAdded ? (
              <Link
                href={`/books/${stats.lastAdded.id}`}
                className="mt-2 block hover:text-primary"
              >
                <p className="font-medium">{stats.lastAdded.title}</p>
                <p className="text-sm text-muted-foreground">
                  {stats.lastAdded.author} ·{" "}
                  {format(stats.lastAdded.createdAt, "MMM d, yyyy")}
                </p>
              </Link>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No books yet</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Last finished
            </p>
            {stats.lastCompleted ? (
              <Link
                href={`/books/${stats.lastCompleted.id}`}
                className="mt-2 block hover:text-primary"
              >
                <p className="font-medium">{stats.lastCompleted.title}</p>
                <p className="text-sm text-muted-foreground">
                  {stats.lastCompleted.author}
                  {stats.lastCompleted.completedAt &&
                    ` · ${format(stats.lastCompleted.completedAt, "MMM d, yyyy")}`}
                </p>
              </Link>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                No completed books yet
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Latest review
            </p>
            {stats.latestReview?.review ? (
              <Link
                href={`/books/${stats.latestReview.id}`}
                className="mt-2 block hover:text-primary"
              >
                <p className="font-medium">{stats.latestReview.title}</p>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {stats.latestReview.review}
                </p>
              </Link>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No reviews yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

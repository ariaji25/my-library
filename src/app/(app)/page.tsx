import Link from "next/link";
import {
  BookCheck,
  BookOpen,
  BookPlus,
  Bookmark,
  Library,
  Quote,
} from "lucide-react";
import { getDashboardStats } from "@/lib/queries";
import { interpolate } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n/server";
import { formatAppDate } from "@/lib/format";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GenreChart } from "@/components/genre-chart";
import { WeeklyProgressChart } from "@/components/weekly-progress-chart";
import { ReadingActivityDashboard } from "@/components/reading-activity-dashboard";

export default async function DashboardPage() {
  const { locale, messages: m } = await getTranslations();
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/10 p-5 shadow-sm shadow-primary/10 sm:p-8 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary sm:text-sm">
          {m.dashboard.welcome}
        </p>
        <h1 className="font-heading mt-2 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
          {m.dashboard.title}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:mt-3 sm:text-base">
          {m.dashboard.subtitle}
        </p>
        <Link
          href="/library/new"
          className="mt-5 inline-flex h-9 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 sm:mt-6"
        >
          <BookPlus className="h-4 w-4" />
          {m.dashboard.addBook}
        </Link>
      </section>

      {stats.quoteOfTheDay?.quoteOfTheDay && (
        <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Quote className="h-5 w-5 text-primary" />
              {m.dashboard.quoteOfDay}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base italic leading-relaxed sm:text-lg">
              &ldquo;{stats.quoteOfTheDay.quoteOfTheDay}&rdquo;
            </p>
            <Link
              href={`/books/${stats.quoteOfTheDay.book.id}`}
              className="mt-3 inline-block text-sm text-muted-foreground hover:text-primary"
            >
              {stats.quoteOfTheDay.book.title} ·{" "}
              {stats.quoteOfTheDay.book.author}
              {" · "}
              {formatAppDate(stats.quoteOfTheDay.date, locale)}
            </Link>
          </CardContent>
        </Card>
      )}

      <ReadingActivityDashboard {...stats.readingActivity} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard label={m.dashboard.statsTotal} value={stats.total} icon={Library} />
        <StatCard label={m.dashboard.statsRead} value={stats.read} icon={BookCheck} />
        <StatCard
          label={m.dashboard.statsReading}
          value={stats.reading}
          icon={BookOpen}
        />
        <StatCard label={m.dashboard.statsUnread} value={stats.unread} icon={BookPlus} />
        <StatCard
          label={m.dashboard.statsWishlist}
          value={stats.wishlistBooks + stats.wishlistCount}
          icon={Bookmark}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>{m.dashboard.weeklyTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {m.dashboard.weeklySubtitle}
            </p>
          </div>
          {stats.currentWeek && (
            <div className="flex gap-6 text-sm tabular-nums">
              <div>
                <span className="text-muted-foreground">{m.dashboard.finishedThisWeek}</span>
                <p className="text-2xl font-semibold">
                  {stats.currentWeek.completed}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">{m.dashboard.startedThisWeek}</span>
                <p className="text-2xl font-semibold">
                  {stats.currentWeek.started}
                </p>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <WeeklyProgressChart data={stats.weeklyProgress} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{m.dashboard.readingProgress}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <span className="text-4xl font-semibold tabular-nums">
                {stats.completedPct}%
              </span>
              <span className="text-sm text-muted-foreground">
                {interpolate(m.dashboard.completedOf, {
                  read: stats.read,
                  total: stats.total,
                })}
              </span>
            </div>
            <Progress value={stats.completedPct} className="h-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{m.dashboard.genreDistribution}</CardTitle>
          </CardHeader>
          <CardContent>
            <GenreChart data={stats.genreDistribution} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{m.dashboard.recentActivity}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:gap-6 md:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {m.dashboard.lastAdded}
            </p>
            {stats.lastAdded ? (
              <Link
                href={`/books/${stats.lastAdded.id}`}
                className="mt-2 block hover:text-primary"
              >
                <p className="font-medium">{stats.lastAdded.title}</p>
                <p className="text-sm text-muted-foreground">
                  {stats.lastAdded.author} ·{" "}
                  {formatAppDate(stats.lastAdded.createdAt, locale)}
                </p>
              </Link>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {m.dashboard.noBooks}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {m.dashboard.lastFinished}
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
                    ` · ${formatAppDate(stats.lastCompleted.completedAt, locale)}`}
                </p>
              </Link>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {m.dashboard.noCompleted}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {m.dashboard.latestReview}
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
              <p className="mt-2 text-sm text-muted-foreground">
                {m.dashboard.noReviews}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

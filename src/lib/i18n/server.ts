import "server-only";

import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  getMessages,
  isLocale,
  type Locale,
} from "@/lib/i18n/core";

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const raw = jar.get(LOCALE_COOKIE)?.value;
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export async function getTranslations() {
  const locale = await getLocale();
  return { locale, messages: getMessages(locale) };
}

export { getMessages, type Locale };

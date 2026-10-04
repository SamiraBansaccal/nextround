import { KeyRound, Plug, Sparkles, Volume2 } from "lucide-react";
import { WithCode } from "@/components/shared/with-code";
import type { AiStatus } from "@/lib/ai/config";
import type { SettingsCopy } from "@/lib/i18n/settings";
import { fill } from "@/lib/interview/copy";

// The top of the Settings page: what is connected right now (AI and voice), with a plain word on
// OpenRouter and on the instance key's limits, so nobody has to guess what the big words mean.

interface Props {
  status: AiStatus;
  /** Today's instance-key calls, shown to the owner when the instance key is in use. */
  usage: { used: number; max: number } | null;
  limits: { perMinute: number; perDay: number };
  t: SettingsCopy;
}

export function ConnectionBanner({ status, usage, limits, t }: Props) {
  const voice = status.voice === "browser" ? t.voiceBrowser : status.voice === "own_key" ? t.voiceElevenOwn : t.voiceElevenInstance;
  return (
    <section aria-labelledby="connected-title" className="overflow-hidden rounded-2xl bg-earth text-earth-foreground shadow-soft">
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div>
          <h2 id="connected-title" className="flex items-center gap-2 font-sans text-xs font-bold tracking-widest text-terracotta-soft uppercase">
            <Plug className="size-4" aria-hidden="true" /> {t.connectedTitle}
          </h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white/10 p-4">
              <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase opacity-75">
                <Sparkles className="size-3.5" aria-hidden="true" /> {t.aiLabel}
              </dt>
              {status.mode === "none" ? (
                <>
                  <dd className="mt-1 font-display text-xl">{t.noAi}</dd>
                  <dd className="mt-1 flex items-start gap-1.5 text-sm opacity-85">
                    <KeyRound className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /> {t.noAiHint}
                  </dd>
                </>
              ) : (
                <>
                  <dd className="mt-1 font-display text-xl">{status.providerLabel}</dd>
                  <dd className="mt-1">
                    <code className="rounded bg-white/15 px-1.5 py-0.5 text-xs break-all">{status.model}</code>
                  </dd>
                  <dd className="mt-1.5 text-sm opacity-85">{status.mode === "own_key" ? t.sourceOwn : t.sourceInstance}</dd>
                </>
              )}
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase opacity-75">
                <Volume2 className="size-3.5" aria-hidden="true" /> {t.voiceLabel}
              </dt>
              <dd className="mt-1 font-display text-xl">{voice}</dd>
              {status.voice === "browser" && <dd className="mt-1.5 text-sm opacity-85">{t.voiceBrowserNote}</dd>}
            </div>
          </dl>
          {usage && (
            <div className="mt-4">
              <p className="text-sm opacity-90">{fill(t.usageToday, { used: usage.used, max: usage.max })}</p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/15" role="meter" aria-valuemin={0} aria-valuemax={usage.max} aria-valuenow={usage.used} aria-label={t.usageToday}>
                <div className="h-full rounded-full bg-terracotta-soft" style={{ width: `${Math.min(100, (usage.used / usage.max) * 100)}%` }} />
              </div>
            </div>
          )}
        </div>
        <div className="space-y-5 text-sm leading-relaxed">
          <div>
            <h3 className="font-sans text-base font-bold text-terracotta-soft">{t.openRouterTitle}</h3>
            <p className="mt-1 opacity-90">
              <WithCode text={t.openRouterText} />
            </p>
          </div>
          <div>
            <h3 className="font-sans text-base font-bold text-terracotta-soft">{t.instanceTitle}</h3>
            <p className="mt-1 opacity-90">{fill(t.instanceText, { perMinute: limits.perMinute, perDay: limits.perDay })}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

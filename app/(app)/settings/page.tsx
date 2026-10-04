import { FileSearch, Volume2 } from "lucide-react";
import { ConnectionBanner } from "@/components/settings/connection-banner";
import { PageHeading } from "@/components/layout/page-heading";
import { WithCode } from "@/components/shared/with-code";
import { AiSettingsForm } from "@/components/settings/ai-settings-form";
import { ServiceKeyForm, type ServiceState } from "@/components/settings/service-key-form";
import { type AiStatus, getAiStatus } from "@/lib/ai/config";
import { DEFAULT_LIMITS, getTodayUsage } from "@/lib/ai/usage";
import { DEFAULT_INSTANCE_MODEL, PRESET_IDS, PRESETS } from "@/lib/ai/providers";
import { getAccount } from "@/lib/server/auth";
import { getPublicAiSettings } from "@/lib/data/ai-settings";
import { serverEnv } from "@/lib/server/env";
import { getUiLang } from "@/lib/i18n/server";
import { SETTINGS_COPY } from "@/lib/i18n/settings";
import { fill } from "@/lib/interview/copy";
import {
  loadModelsAction,
  removeAiKeyAction,
  removeFirecrawlKeyAction,
  removeVoiceKeyAction,
  saveAiSettingsAction,
  saveFirecrawlKeyAction,
  saveVoiceKeyAction,
  testConnectionAction,
} from "./actions";

const asState = (mode: AiStatus["voice"] | AiStatus["pages"]): ServiceState => (mode === "own_key" ? "own" : mode === "instance" ? "instance" : "free");

export default async function SettingsPage() {
  const account = await getAccount();
  const lang = await getUiLang();
  const t = SETTINGS_COPY[lang];
  const [settings, status, usage] = await Promise.all([getPublicAiSettings(account.userId), getAiStatus(account.userId, account.isOwner), getTodayUsage(account.userId)]);
  const env = serverEnv();
  const keyCopy = { save: t.save, remove: t.remove };

  return (
    <div>
      <PageHeading eyebrow={t.eyebrow} title={t.title} />
      <div className="space-y-6">
        <ConnectionBanner
          status={status}
          usage={account.isOwner && status.mode === "instance" ? { used: usage.llm, max: DEFAULT_LIMITS.llm.perDay } : null}
          limits={DEFAULT_LIMITS.llm}
          t={t}
        />
        <div className="grid items-start gap-6 lg:grid-cols-2">
        <AiSettingsForm
          initial={settings}
          presets={PRESET_IDS.map((id) => ({ id, label: PRESETS[id].label, keysUrl: PRESETS[id].keysUrl }))}
          allowCustom={env.ALLOW_CUSTOM_LLM_BASE_URL === "true"}
          isOwner={account.isOwner}
          suggestedModel={DEFAULT_INSTANCE_MODEL}
          actions={{ save: saveAiSettingsAction, removeKey: removeAiKeyAction, test: testConnectionAction, loadModels: loadModelsAction }}
          t={t}
        />
        <div className="space-y-6">
          <ServiceKeyForm
            id="voice-key"
            icon={<Volume2 className="size-5" aria-hidden="true" />}
            title={t.voiceTitle}
            intro={
              <>
                {t.voiceIntro}
                {account.isOwner && <WithCode text={t.voiceOwner} />}
                {t.voiceCredits}
              </>
            }
            usedFor={{ title: t.voiceUsedFor, items: [t.voiceUses.read, t.voiceUses.dictate] }}
            copy={{ ...keyCopy, key: t.voiceKey, savedKey: t.voiceSavedKey, empty: t.voiceEmpty, saved: t.voiceSaved, removed: t.voiceRemoved, currently: t.currently }}
            states={{ own: t.currentOwn, instance: t.currentInstance, free: t.currentBrowser }}
            current={asState(status.voice)}
            fallback={account.isOwner && env.ELEVENLABS_API_KEY && env.INSTANCE_VOICE_ENABLED === "true" ? "instance" : "free"}
            hasKey={settings?.hasVoiceKey ?? false}
            keyLast4={settings?.voiceKeyLast4 ?? null}
            actions={{ save: saveVoiceKeyAction, remove: removeVoiceKeyAction }}
          />
          <ServiceKeyForm
            id="firecrawl-key"
            icon={<FileSearch className="size-5" aria-hidden="true" />}
            title={t.pagesTitle}
            intro={
              <>
                {t.pagesIntro}
                {account.isOwner && env.FIRECRAWL_API_API_KEY && fill(t.pagesOwner, { perDay: DEFAULT_LIMITS.scrape.perDay })}
              </>
            }
            usedFor={{ title: t.pagesUsedFor, items: [t.pagesUses.add] }}
            copy={{ ...keyCopy, key: t.pagesKey, savedKey: t.pagesSavedKey, empty: t.pagesEmpty, saved: t.pagesSaved, removed: t.pagesRemoved, currently: t.pagesCurrently }}
            states={{ own: t.pagesCurrentOwn, instance: t.pagesCurrentInstance, free: t.pagesCurrentBuiltin }}
            current={asState(status.pages)}
            fallback={account.isOwner && env.FIRECRAWL_API_API_KEY ? "instance" : "free"}
            hasKey={settings?.hasFirecrawlKey ?? false}
            keyLast4={settings?.firecrawlKeyLast4 ?? null}
            getKey={{ url: "https://www.firecrawl.dev/app/api-keys", label: t.getFirecrawlKey }}
            actions={{ save: saveFirecrawlKeyAction, remove: removeFirecrawlKeyAction }}
          />
        </div>
        </div>
      </div>
    </div>
  );
}

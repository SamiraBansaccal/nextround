import { ConnectionBanner } from "@/components/settings/connection-banner";
import { PageHeading } from "@/components/layout/page-heading";
import { AiSettingsForm } from "@/components/settings/ai-settings-form";
import { VoiceSettingsForm } from "@/components/settings/voice-settings-form";
import { getAiStatus } from "@/lib/ai/config";
import { DEFAULT_LIMITS, getTodayUsage } from "@/lib/ai/usage";
import { DEFAULT_INSTANCE_MODEL, PRESET_IDS, PRESETS } from "@/lib/ai/providers";
import { getAccount } from "@/lib/server/auth";
import { getPublicAiSettings } from "@/lib/data/ai-settings";
import { serverEnv } from "@/lib/server/env";
import { getUiLang } from "@/lib/i18n/server";
import { SETTINGS_COPY } from "@/lib/i18n/settings";
import {
  loadModelsAction,
  removeAiKeyAction,
  removeVoiceKeyAction,
  saveAiSettingsAction,
  saveVoiceKeyAction,
  testConnectionAction,
} from "./actions";

export default async function SettingsPage() {
  const account = await getAccount();
  const lang = await getUiLang();
  const t = SETTINGS_COPY[lang];
  const [settings, status, usage] = await Promise.all([getPublicAiSettings(account.userId), getAiStatus(account.userId, account.isOwner), getTodayUsage(account.userId)]);
  const env = serverEnv();

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
        <VoiceSettingsForm
          hasKey={settings?.hasVoiceKey ?? false}
          keyLast4={settings?.voiceKeyLast4 ?? null}
          isOwner={account.isOwner}
          currentVoice={status.voice}
          fallbackVoice={account.isOwner && env.ELEVENLABS_API_KEY && env.INSTANCE_VOICE_ENABLED === "true" ? "instance" : "browser"}
          actions={{ save: saveVoiceKeyAction, remove: removeVoiceKeyAction }}
          t={t}
        />
        </div>
      </div>
    </div>
  );
}

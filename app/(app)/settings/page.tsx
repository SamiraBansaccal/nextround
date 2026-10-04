import { AiStatusCard } from "@/components/ai/ai-status-card";
import { PageHeading } from "@/components/page-heading";
import { AiSettingsForm } from "@/components/settings/ai-settings-form";
import { VoiceSettingsForm } from "@/components/settings/voice-settings-form";
import { getAiStatus } from "@/lib/ai/config";
import { DEFAULT_INSTANCE_MODEL, PRESET_IDS, PRESETS } from "@/lib/ai/providers";
import { getAccount } from "@/lib/auth";
import { getPublicAiSettings } from "@/lib/data/ai-settings";
import { serverEnv } from "@/lib/env";
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
  const [settings, status] = await Promise.all([getPublicAiSettings(account.userId), getAiStatus(account.userId, account.isOwner)]);
  const env = serverEnv();

  return (
    <div>
      <PageHeading eyebrow={t.eyebrow} title={t.title} />
      <div className="max-w-2xl space-y-6">
        <AiStatusCard status={status} showSettingsLink={false} lang={lang} />
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
  );
}

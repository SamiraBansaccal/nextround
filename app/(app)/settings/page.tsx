import { AiStatusCard } from "@/components/ai/ai-status-card";
import { AiSettingsForm } from "@/components/settings/ai-settings-form";
import { VoiceSettingsForm } from "@/components/settings/voice-settings-form";
import { getAiStatus } from "@/lib/ai/config";
import { DEFAULT_INSTANCE_MODEL, PRESET_IDS, PRESETS } from "@/lib/ai/providers";
import { getAccount } from "@/lib/auth";
import { getPublicAiSettings } from "@/lib/data/ai-settings";
import { serverEnv } from "@/lib/env";
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
  const [settings, status] = await Promise.all([
    getPublicAiSettings(account.userId),
    getAiStatus(account.userId, account.isOwner),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Bring your own AI. Your keys stay on the server, encrypted.</p>
      </div>
      <AiStatusCard status={status} showSettingsLink={false} />
      <AiSettingsForm
        initial={settings}
        presets={PRESET_IDS.map((id) => ({ id, label: PRESETS[id].label, keysUrl: PRESETS[id].keysUrl }))}
        allowCustom={serverEnv().ALLOW_CUSTOM_LLM_BASE_URL === "true"}
        isOwner={account.isOwner}
        suggestedModel={DEFAULT_INSTANCE_MODEL}
        actions={{
          save: saveAiSettingsAction,
          removeKey: removeAiKeyAction,
          test: testConnectionAction,
          loadModels: loadModelsAction,
        }}
      />
      <VoiceSettingsForm
        hasKey={settings?.hasVoiceKey ?? false}
        keyLast4={settings?.voiceKeyLast4 ?? null}
        isOwner={account.isOwner}
        actions={{ save: saveVoiceKeyAction, remove: removeVoiceKeyAction }}
      />
    </div>
  );
}

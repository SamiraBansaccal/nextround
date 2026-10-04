export const startInterviewAction = async () => ({ ok: false as const, error: "preview" });
export const deleteInterviewAction = async () => ({ ok: true });
export const switchInterviewerAction = async () => ({ ok: true });
export const submitAnswerAction = async () => ({ ok: false as const, error: "preview" });

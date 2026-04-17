import { api } from "@/lib/api";

export async function postApplyReferralCode(code: string): Promise<void> {
  await api.post("/users/me/referral", { code: code.trim().toUpperCase() });
}

export type ReferredUserRow = {
  id: string;
  fullName: string | null;
  createdAt: string;
};

export async function fetchMyReferredUsers(): Promise<ReferredUserRow[]> {
  const { data } = await api.get<{ items: ReferredUserRow[] }>("/users/me/referrals");
  return data.items ?? [];
}

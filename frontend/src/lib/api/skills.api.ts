import { api } from "@/lib/api";

export type SkillRow = {
  id: string;
  name: string;
  category: string;
  createdAt?: string;
};

export type SkillsGroupedByCategory = {
  category: string;
  skills: SkillRow[];
}[];

export async function getAllSkills(): Promise<SkillsGroupedByCategory> {
  const { data } = await api.get<SkillsGroupedByCategory>("/skills");
  return data;
}

import { templateRepository } from "../repositories";
import type { Template } from "@virlio/database/types";

export async function upload(userId: string, data: Partial<Template>) {
  return templateRepository.create({ ...data, uploaded_by: userId } as any);
}

export async function update(templateId: string, userId: string, data: Partial<Template>) {
  const template = await templateRepository.findById(templateId);
  if (!template || template.uploaded_by !== userId) throw new Error("Unauthorized");
  return templateRepository.update(templateId, data);
}

export async function getBySlug(slug: string) {
  return templateRepository.findBySlug(slug);
}

export async function getByCategory(category: string, options: { limit?: number; offset?: number } = {}) {
  return templateRepository.findByCategory(category, options);
}

export async function getPublicTemplates(options: { limit?: number; offset?: number } = {}) {
  return templateRepository.findPublicTemplates(options);
}

export async function search(query: string, options: { limit?: number; offset?: number } = {}) {
  return templateRepository.search(query, options);
}

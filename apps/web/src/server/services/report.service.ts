import { reportRepository } from "../repositories";

export async function submit(userId: string, data: any) {
  return reportRepository.create({ ...data, reporterId: userId });
}

export async function review(reportId: string, moderatorId: string) {
  // Logic to put it in review if needed, here we just return the report
  return reportRepository.findPending(); 
}

export async function resolve(reportId: string, moderatorId: string, notes?: string) {
  return reportRepository.resolve(reportId, moderatorId, notes);
}

export async function dismiss(reportId: string, moderatorId: string, notes?: string) {
  return reportRepository.dismiss(reportId, moderatorId, notes);
}

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required").max(100),
});

export const managerSchema = z.object({
  name: z.string().min(1, "Manager name is required").max(100),
  title: z.string().max(100).optional(),
  companyId: z.string().min(1),
});

export const employeeSchema = z.object({
  name: z.string().min(1, "Employee name is required").max(100),
  role: z.string().min(1, "Role is required").max(100),
  companyId: z.string().min(1),
  managerId: z.string().min(1, "Manager is required"),
});

export const kpiSchema = z.object({
  name: z.string().min(1, "KPI name is required").max(200),
  formQuestion: z.string().min(1, "Form question is required").max(500),
  employeeId: z.string().min(1),
});

export const evaluationSubmissionSchema = z.object({
  scores: z.array(
    z.object({
      kpiId: z.string().min(1),
      managerScore: z.number().int().min(1).max(5),
      managerComment: z.string().optional(),
    })
  ),
  managerRecommendations: z
    .string()
    .min(1, "Recommendations and Next Steps is required"),
});

export const hrScoreAdjustmentSchema = z.object({
  evaluationId: z.string().min(1),
  scores: z.array(
    z.object({
      scoreId: z.string().min(1),
      hrAdjustedScore: z.number().int().min(1).max(5).nullable(),
      hrComment: z.string().nullable(),
      showToEmployee: z.boolean(),
    })
  ),
});

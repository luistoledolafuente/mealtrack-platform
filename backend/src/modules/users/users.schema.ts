import { z } from 'zod';

export const createUserSchema = z.object({
  fullName: z.string().min(1).max(100),
  email: z.string().email('Correo inválido'),
  phone: z.string().max(30).optional(),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(100).optional(),
  role: z.enum(['student', 'admin']).optional().default('student'),
  restaurantId: z.string().uuid('ID de restaurante inválido').optional(),
  planId: z.string().uuid('ID de plan inválido').optional(),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual obligatoria'),
  newPassword: z.string().min(8, 'Mínimo 8 caracteres').max(100),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
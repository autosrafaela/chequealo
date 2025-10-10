import { z } from 'zod';

/**
 * Security-focused validation schemas for contact forms and user inputs
 * These schemas prevent injection attacks, data corruption, and enforce proper data formats
 */

// Phone number validation (international format with optional country code)
export const phoneSchema = z
  .string()
  .trim()
  .min(7, 'El número de teléfono debe tener al menos 7 dígitos')
  .max(15, 'El número de teléfono no puede tener más de 15 dígitos')
  .regex(/^[+]?[\d\s-()]+$/, 'El número de teléfono solo puede contener dígitos, espacios, guiones y paréntesis')
  .transform((val) => val.replace(/\D/g, '')) // Clean to only digits
  .refine((val) => val.length >= 7 && val.length <= 15, {
    message: 'El número debe tener entre 7 y 15 dígitos después de limpieza'
  });

// Email validation
export const emailSchema = z
  .string()
  .trim()
  .email('Debe ser un email válido')
  .max(255, 'El email no puede tener más de 255 caracteres')
  .toLowerCase();

// Name validation (prevents excessive length and special characters)
export const nameSchema = z
  .string()
  .trim()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(100, 'El nombre no puede tener más de 100 caracteres')
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, 'El nombre solo puede contener letras, espacios, guiones y apóstrofes');

// Message validation (prevents XSS and excessive length)
export const messageSchema = z
  .string()
  .trim()
  .min(10, 'El mensaje debe tener al menos 10 caracteres')
  .max(1000, 'El mensaje no puede tener más de 1000 caracteres')
  .refine((val) => {
    // Prevent common XSS patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /onerror=/i,
      /onload=/i,
      /<iframe/i,
      /eval\(/i,
    ];
    return !dangerousPatterns.some(pattern => pattern.test(val));
  }, {
    message: 'El mensaje contiene contenido no permitido'
  });

// Budget range validation
export const budgetRangeSchema = z
  .string()
  .trim()
  .max(50, 'El rango de presupuesto no puede tener más de 50 caracteres')
  .optional();

// Service type validation
export const serviceTypeSchema = z
  .string()
  .trim()
  .max(100, 'El tipo de servicio no puede tener más de 100 caracteres')
  .optional();

// Contact request schema
export const contactRequestSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  message: messageSchema,
  serviceType: serviceTypeSchema,
  budgetRange: budgetRangeSchema,
});

// Review schema
export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'La calificación debe ser al menos 1').max(5, 'La calificación no puede ser mayor a 5'),
  comment: z
    .string()
    .trim()
    .min(10, 'El comentario debe tener al menos 10 caracteres')
    .max(500, 'El comentario no puede tener más de 500 caracteres')
    .optional(),
  serviceProvided: z
    .string()
    .trim()
    .max(200, 'El servicio proporcionado no puede tener más de 200 caracteres')
    .optional(),
});

// Professional profile schema
export const professionalProfileSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  profession: z
    .string()
    .trim()
    .min(2, 'La profesión debe tener al menos 2 caracteres')
    .max(100, 'La profesión no puede tener más de 100 caracteres'),
  location: z
    .string()
    .trim()
    .max(200, 'La ubicación no puede tener más de 200 caracteres')
    .optional(),
  description: z
    .string()
    .trim()
    .max(2000, 'La descripción no puede tener más de 2000 caracteres')
    .optional(),
});

// Export types for TypeScript
export type ContactRequestInput = z.infer<typeof contactRequestSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ProfessionalProfileInput = z.infer<typeof professionalProfileSchema>;

import { z } from 'zod';
import { HttpError } from './errors.js';

const MAX_CENTS = 10_000_000; // R$ 100.000,00 — teto de sanidade

const text = (max) => z.string().trim().max(max);
const slug = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use apenas letras minúsculas, números e hífen.');

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida.');

export const productSchema = z
  .object({
    name: text(120).min(2),
    slug: z.union([slug, z.literal('')]).optional(),
    categoryId: z.string().trim().min(1).max(60),
    description: text(2000).default(''),
    details: z.array(text(200)).max(20).default([]),
    tags: z.array(text(24)).max(6).default([]),
    // Duas cores: fundo do gradiente usado nos cards e na galeria.
    colors: z.array(hexColor).length(2).default(['#FDE3EA', '#F7C3D0']),
    priceCents: z.number().int().min(1).max(MAX_CENTS),
    wholesaleCents: z.number().int().min(1).max(MAX_CENTS),
    minWholesale: z.number().int().min(1).max(999).default(6),
    featured: z.boolean().default(false),
    active: z.boolean().default(true),
  })
  .refine((value) => value.wholesaleCents <= value.priceCents, {
    message: 'O preço de atacado não pode ser maior que o de varejo.',
    path: ['wholesaleCents'],
  });

export const categorySchema = z.object({
  id: slug.optional(),
  name: text(80).min(2),
  emoji: text(8).default(''),
  tone: z.enum(['rosa', 'creme', 'azul', 'verde', 'laranja', 'lilas', 'amarelo']).default('rosa'),
});

const storeTime = z.object({ days: text(60).min(1), time: text(40).min(1) });

export const settingsSchema = z.object({
  name: text(60).min(1),
  tagline: text(60).min(1),
  // WhatsApp é só dígitos com DDI, porque vira link wa.me.
  whatsapp: z
    .string()
    .trim()
    .regex(/^\d{10,15}$/, 'WhatsApp deve ter só dígitos, com DDI (ex.: 5511999999999).'),
  whatsappLabel: text(30).min(1),
  instagram: text(60).min(1),
  instagramUrl: z.string().trim().url().max(300),
  email: z.string().trim().email().max(254),
  address: text(160).min(1),
  city: text(80).min(1),
  hours: z.array(storeTime).max(14).default([]),
  payments: z.array(text(30)).max(12).default([]),
  wholesaleMin: z.number().int().min(1).max(999),
  freeShippingNote: text(120).default(''),
});

export const loginSchema = z.object({
  email: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(200),
});

/**
 * Converte o resultado do Zod em HttpError 400 com a lista de campos. Só
 * mensagens de validação saem daqui — nunca o objeto recebido.
 */
export function parseBody(schema, body) {
  const result = schema.safeParse(body);
  if (result.success) return result.data;

  const issues = result.error.issues.map((issue) => ({
    field: issue.path.join('.') || '(corpo)',
    message: issue.message,
  }));

  const error = new HttpError(400, 'validation_failed', 'Confira os campos destacados.');
  error.issues = issues;
  throw error;
}

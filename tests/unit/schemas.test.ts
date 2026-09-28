import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';
import { makeWorkSchema, proofSchema } from '../../src/content/schemas';

const workSchema = makeWorkSchema(z.string());

const valid = {
  inventory: 'RP-2026-01',
  title: 'Ubbfy',
  summary: 'ERP suite with geolocated time clock.',
  year: 2026,
  role: 'Lead engineer, architecture and rebuild',
  materials: ['Django 5', 'Vue 3'],
  status: 'live',
  liveUrl: 'https://app.ubbfy.com',
  room: 1,
  screenshots: [{ src: './ubbfy.png', alt: 'Ubbfy landing page', kind: 'public' }],
  proofs: [{ text: '20 Django apps behind one API', source: 'counted in the ubbfy repo' }],
  seoDescription: 'Ubbfy, an ERP suite rebuilt on Django 5 and Vue 3.',
};

describe('proofSchema', () => {
  it('rejects a proof without a source (no fake metrics)', () => {
    expect(proofSchema.safeParse({ text: '+240% traffic' }).success).toBe(false);
    expect(proofSchema.safeParse({ text: '+240% traffic', source: '' }).success).toBe(false);
  });
});

describe('makeWorkSchema', () => {
  it('accepts a complete work', () => {
    expect(workSchema.safeParse(valid).success).toBe(true);
  });

  it('defaults proofs to an empty list', () => {
    const { proofs, ...rest } = valid;
    const parsed = workSchema.parse(rest);
    expect(parsed.proofs).toEqual([]);
  });

  it('requires liveUrl when status is live', () => {
    const { liveUrl, ...rest } = valid;
    const result = workSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('allows an archived work without liveUrl and outside Room I', () => {
    const { liveUrl, ...rest } = valid;
    expect(workSchema.safeParse({ ...rest, status: 'archived', room: null }).success).toBe(true);
  });

  it.each([
    ['inventory format', { inventory: 'RP-26-1' }],
    ['empty materials', { materials: [] }],
    ['no screenshot', { screenshots: [] }],
    ['screenshot without alt', { screenshots: [{ src: './a.png', alt: '', kind: 'public' }] }],
    ['unknown status', { status: 'draft' }],
    ['room out of range', { room: 5 }],
    ['seoDescription too long', { seoDescription: 'x'.repeat(171) }],
  ])('rejects %s', (_label, patch) => {
    expect(workSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });
});

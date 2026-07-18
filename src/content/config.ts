import { defineCollection, z } from 'astro:content';

// Blog Schema
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.string().or(z.date()).transform((val) => new Date(val).toISOString().split('T')[0]),
    updateDate: z.string().or(z.date()).transform((val) => new Date(val).toISOString().split('T')[0]).optional(),
    author: z.string().default('Sistemas ASC'),
    authorLinkedin: z.string().url().optional(),
    image: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
  })
});

// Common Schema for Services and Industries
const landingSchema = z.object({
  title: z.string(),
  metaDescription: z.string(),
  serviceType: z.string(),
  h1: z.string(),
  subtitle: z.string(),
  intro: z.string(),
  benefits: z.array(z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string(),
  })),
  howItWorks: z.array(z.object({
    step: z.number(),
    title: z.string(),
    description: z.string(),
  })),
  cases: z.array(z.object({
    title: z.string(),
    description: z.string(),
    result: z.string(),
    clientSlug: z.string().optional(), // For linking to cases
  })).default([]),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })),
  conversionGoal: z.string().default('whatsapp-cta'),
});

const servicesCollection = defineCollection({
  type: 'data',
  schema: landingSchema
});

const industriesCollection = defineCollection({
  type: 'data',
  schema: landingSchema
});

// Success Cases Collection
const casesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    client: z.string(),
    description: z.string(),
    publishDate: z.string().or(z.date()).transform((val) => new Date(val).toISOString().split('T')[0]),
    updateDate: z.string().or(z.date()).transform((val) => new Date(val).toISOString().split('T')[0]).optional(),
    logo: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    metrics: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })).default([]),
    quote: z.object({
      text: z.string(),
      author: z.string(),
      role: z.string(),
    }).optional(),
    serviceSlug: z.string().optional(),  // Link back to service landing
    industrySlug: z.string().optional(), // Link back to industry landing
  })
});

export const collections = {
  'blog': blogCollection,
  'services': servicesCollection,
  'industries': industriesCollection,
  'cases': casesCollection,
};

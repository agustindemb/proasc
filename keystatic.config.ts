import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: 'agustindemb/proasc',
  },

  ui: {
    brand: { name: 'ProASC CMS' },
  },

  collections: {
    blog: collection({
      label: 'Blog',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      columns: ['title', 'publishDate', 'category'],
      schema: {
        // Title generates the slug automatically
        title: fields.slug({
          name: {
            label: 'Título',
            description: 'Título del artículo. El slug se genera automáticamente.',
            validation: { isRequired: true },
          },
        }),

        // Meta description — required for SEO
        description: fields.text({
          label: 'Descripción (meta SEO)',
          multiline: true,
          description: 'Aparece en Google y redes sociales. Ideal: 120–160 caracteres.',
          validation: { isRequired: true, length: { min: 60, max: 165 } },
        }),

        // Publish date — required
        publishDate: fields.date({
          label: 'Fecha de publicación',
          defaultValue: { kind: 'today' },
          validation: { isRequired: true },
        }),

        // Optional update date
        updateDate: fields.date({
          label: 'Fecha de actualización',
        }),

        // Author — required (defaults to the main author)
        author: fields.text({
          label: 'Autor',
          defaultValue: 'Agustín Demb',
          validation: { isRequired: true },
        }),

        // Author LinkedIn URL (optional)
        authorLinkedin: fields.url({
          label: 'LinkedIn del autor',
        }),

        // Category — required, predefined list
        category: fields.select({
          label: 'Categoría',
          options: [
            { label: 'WhatsApp', value: 'WhatsApp' },
            { label: 'Automatización', value: 'Automatización' },
            { label: 'CRM', value: 'CRM' },
            { label: 'IA', value: 'IA' },
            { label: 'Casos de éxito', value: 'Casos de éxito' },
            { label: 'Guías', value: 'Guías' },
          ],
          defaultValue: 'Automatización',
        }),

        // Tags (repeatable text)
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          {
            label: 'Tags',
            itemLabel: (props) => props.value || 'Nuevo tag',
          }
        ),

        // Featured image — required for OG/SEO
        image: fields.image({
          label: 'Imagen destacada',
          description: 'Requerida. Usada en redes sociales y encabezado del artículo.',
          directory: 'public/images/blog',
          publicPath: '/images/blog/',
          validation: { isRequired: true },
        }),

        // Image alt text — required for accessibility and SEO
        imageAlt: fields.text({
          label: 'Texto alternativo de la imagen (alt)',
          description: 'Describe la imagen para lectores de pantalla y SEO. Requerido.',
          validation: { isRequired: true },
        }),

        // Main content — required
        content: fields.markdoc({
          label: 'Contenido del artículo',
          options: {
            image: {
              directory: 'public/images/blog',
              publicPath: '/images/blog/',
            },
          },
        }),
      },
    }),
  },
});

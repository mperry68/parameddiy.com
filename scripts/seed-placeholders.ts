/**
 * Utility script to generate placeholder article files
 * 
 * Usage:
 *   npx tsx scripts/seed-placeholders.ts
 * 
 * Or add to package.json:
 *   "seed": "tsx scripts/seed-placeholders.ts"
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { categories, categoryLabels } from '../src/config';

interface ArticleTemplate {
  title: string;
  slug: string;
  summary: string;
  category: typeof categories[number];
  tags: string[];
  featured?: boolean;
}

const articleTemplates: ArticleTemplate[] = [
  {
    title: 'Introduction to Physical Therapy Techniques',
    slug: 'introduction-physical-therapy-techniques',
    summary: 'Explore fundamental physical therapy techniques used in rehabilitation and treatment.',
    category: 'physiotherapy',
    tags: ['physical therapy', 'techniques', 'rehabilitation'],
    featured: false,
  },
  {
    title: 'Healthy Eating for Active Lifestyles',
    slug: 'healthy-eating-active-lifestyles',
    summary: 'Nutrition strategies to support an active lifestyle and optimize performance.',
    category: 'nutrition',
    tags: ['nutrition', 'fitness', 'diet'],
    featured: false,
  },
  {
    title: 'Building Mental Resilience',
    slug: 'building-mental-resilience',
    summary: 'Learn strategies to develop mental resilience and cope with life\'s challenges.',
    category: 'mental_wellbeing',
    tags: ['mental health', 'resilience', 'coping'],
    featured: false,
  },
  {
    title: 'Preventing Sports Injuries',
    slug: 'preventing-sports-injuries',
    summary: 'Essential tips and techniques to prevent common sports-related injuries.',
    category: 'prevention',
    tags: ['sports', 'injury prevention', 'exercise'],
    featured: false,
  },
  {
    title: 'Occupational Therapy for Seniors',
    slug: 'occupational-therapy-seniors',
    summary: 'How occupational therapy helps older adults maintain independence and quality of life.',
    category: 'occupational_therapy',
    tags: ['seniors', 'aging', 'independence'],
    featured: false,
  },
  {
    title: 'Recovery After Joint Replacement',
    slug: 'recovery-joint-replacement',
    summary: 'A comprehensive guide to rehabilitation following joint replacement surgery.',
    category: 'rehabilitation',
    tags: ['surgery', 'recovery', 'joint replacement'],
    featured: false,
  },
  {
    title: 'Maintaining Heart Health',
    slug: 'maintaining-heart-health',
    summary: 'Practical steps to maintain cardiovascular health and prevent heart disease.',
    category: 'general_health',
    tags: ['heart health', 'cardiovascular', 'prevention'],
    featured: false,
  },
  {
    title: 'Understanding Chronic Pain Management',
    slug: 'chronic-pain-management',
    summary: 'Approaches to managing chronic pain and improving quality of life.',
    category: 'general_health',
    tags: ['pain management', 'chronic pain', 'wellness'],
    featured: false,
  },
];

const loremContent = `## Introduction

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

## Main Content

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### Key Points

- Point one about the topic
- Point two with more details
- Point three covering important aspects
- Point four for comprehensive coverage

## Practical Applications

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.

## Conclusion

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint.`;

function generateArticleFile(template: ArticleTemplate): string {
  const now = new Date();
  const publishedDate = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000); // Random date within last 90 days
  const updatedDate = Math.random() > 0.7 
    ? new Date(publishedDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000)
    : undefined;

  const frontmatter = {
    title: template.title,
    slug: template.slug,
    summary: template.summary,
    category: template.category,
    tags: template.tags,
    publishedAt: publishedDate.toISOString().split('T')[0],
    ...(updatedDate && { updatedAt: updatedDate.toISOString().split('T')[0] }),
    readingTime: Math.floor(Math.random() * 10) + 5, // 5-15 minutes
    ...(template.featured && { featured: true }),
  };

  const frontmatterString = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: [${value.map(v => `'${v}'`).join(', ')}]`;
      }
      if (typeof value === 'string') {
        return `${key}: ${value.includes("'") ? `"${value}"` : `'${value}'`}`;
      }
      if (typeof value === 'boolean') {
        return `${key}: ${value}`;
      }
      return `${key}: ${value}`;
    })
    .join('\n');

  return `---
${frontmatterString}
---

${loremContent}
`;
}

function main() {
  const contentDir = join(process.cwd(), 'src', 'content', 'articles');
  
  // Create directory if it doesn't exist
  if (!existsSync(contentDir)) {
    mkdirSync(contentDir, { recursive: true });
    console.log(`Created directory: ${contentDir}`);
  }

  console.log(`Generating ${articleTemplates.length} placeholder articles...\n`);

  articleTemplates.forEach((template) => {
    const content = generateArticleFile(template);
    const filePath = join(contentDir, `${template.slug}.md`);
    
    // Check if file already exists
    if (existsSync(filePath)) {
      console.log(`⚠️  Skipping ${template.slug}.md (already exists)`);
      return;
    }

    writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Created ${template.slug}.md`);
  });

  console.log(`\n✅ Generated ${articleTemplates.length} placeholder articles in ${contentDir}`);
  console.log('\nNote: These are placeholder articles with lorem ipsum content.');
  console.log('Replace the content with actual article text as needed.');
}

if (require.main === module) {
  main();
}

export { generateArticleFile, articleTemplates };


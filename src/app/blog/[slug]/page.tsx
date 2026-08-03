import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogArticleBySlug, BLOG_ARTICLES } from '@/lib/seo/blogArticlesData';
import { getArticleSchema, getFAQSchema, getBreadcrumbSchema } from '@/lib/seo/schemaGenerator';
import BlogArticleView from '@/components/seo/BlogArticleView';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return BLOG_ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const article = getBlogArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found | THE BIKE RENTAL BALI',
      description: 'The requested guide could not be found.',
    };
  }

  return {
    title: article.title,
    description: article.metaDescription,
    alternates: {
      canonical: `https://thebikerentalbali.com/blog/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.metaDescription,
      url: `https://thebikerentalbali.com/blog/${article.slug}`,
      siteName: 'THE BIKE RENTAL BALI',
      locale: 'en_US',
      type: 'article',
      publishedTime: article.publishDate,
      authors: ['THE BIKE RENTAL BALI Editorial Team'],
      images: [
        {
          url: 'https://thebikerentalbali.com/icons/icon-512x512.png',
          width: 512,
          height: 512,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.metaDescription,
      images: ['https://thebikerentalbali.com/icons/icon-512x512.png'],
    },
  };
}

export default async function BlogDetailPage(props: Props) {
  const { slug } = await props.params;
  const article = getBlogArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const articleSchema = getArticleSchema({
    title: article.title,
    description: article.metaDescription,
    slug: article.slug,
    datePublished: article.publishDate,
    dateModified: article.publishDate,
    authorName: 'THE BIKE RENTAL BALI Team',
    image: 'https://thebikerentalbali.com/icons/icon-512x512.png',
  });

  const faqSchema = getFAQSchema(article.faqs || []);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://thebikerentalbali.com' },
    { name: 'Guides & Blog', url: 'https://thebikerentalbali.com/blog' },
    { name: article.title, url: `https://thebikerentalbali.com/blog/${article.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <BlogArticleView article={article} />
    </>
  );
}

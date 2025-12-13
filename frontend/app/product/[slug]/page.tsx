import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/products/product-detail";
import { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

/**
 * Product Detail Page - Client Side
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // Fetch product client-side
  return <ProductDetail slug={slug} />;
}

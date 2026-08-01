import { redirect, notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Metadata } from "next";

type Props = {
  params: { vendorSlug: string }
}

// Generate metadata for social sharing (WhatsApp, Facebook, etc.)
export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: vendors } = await supabase.from('vendors').select('id, name, logo');
  if (vendors) {
    const vendor = vendors.find(v => v.name.toLowerCase().replace(/[^a-z0-9]+/g, '') === params.vendorSlug);
    if (vendor) {
      return {
        title: `${vendor.name} - Premium Scooter Rental in Bali`,
        description: `Rent a scooter from ${vendor.name}. High-quality bikes and excellent service for your Bali adventure.`,
        openGraph: {
          title: vendor.name,
          description: `Rent a scooter from ${vendor.name} in Bali.`,
          images: vendor.logo ? [vendor.logo] : [],
        },
      }
    }
  }

  return {
    title: 'Vendor Not Found - Putu Rentals',
    description: 'The requested vendor profile could not be found.',
  }
}

export default async function VendorSlugPage({ params }: Props) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: vendors } = await supabase.from('vendors').select('id, name');
  
  if (vendors) {
    const vendor = vendors.find(v => v.name.toLowerCase().replace(/[^a-z0-9]+/g, '') === params.vendorSlug);
    if (vendor) {
      // Server-side redirect to the actual vendor ID profile page
      redirect(`/vendor/${vendor.id}`);
    }
  }

  notFound();
}

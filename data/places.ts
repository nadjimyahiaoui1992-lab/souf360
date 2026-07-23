import { supabase } from '@/lib/supabaseClient';

export type PlaceCategory = string;
export type PlacePopularity = "high" | "medium" | "low";

export interface Place {
  id: number;
  name: string;
  subtitle: string;
  category: PlaceCategory;
  municipality: string;
  district?: string;
  popularity: PlacePopularity;
  lat: number;
  lng: number;
  rating: number;
  image: string;
  description: string;
  location: string;
  tags: string[];
  phone?: string;
  website?: string;
  openingHours?: string;
}

export async function getPlacesFromDB(): Promise<Place[]> {
  const { data, error } = await supabase.from('places').select('*');

  if (error || !data) {
    console.error("خطأ في جلب البيانات من قاعدة البيانات:", error);
    return [];
  }

  return data.map((item: any) => {
    let finalImage = "/images/images.jpg";
    if (item.image_url) {
      try {
        const parsed = JSON.parse(item.image_url);
        finalImage = parsed[0] || item.image_url;
      } catch (e) {
        finalImage = String(item.image_url).replace(/[\[\]"]/g, '');
      }
    }

    return {
      id: item.id,
      name: item.name,
      subtitle: item.description ? item.description.substring(0, 40) + "..." : item.name,
      category: item.category || 'تاريخ وثقافة',
      municipality: item.municipality || "الوادي",
      district: item.district || "الوادي",
      popularity: "high",
      lat: item.lat || 33.3683,
      lng: item.lng || 6.8667,
      rating: item.rating || 4.5,
      image: finalImage,
      description: item.description || '',
      location: item.municipality || "الوادي",
      tags: [item.category || 'سياحة'],
      phone: item.phone,
      website: item.website,
      openingHours: item.opening_hours,
    };
  });
}

import { query } from "./db";
import { cached, TAGS } from "./cache";
import type { ServiceRow } from "@/components/site/Services";
import type { ProjectRow } from "@/components/site/Portfolio";
import type { TestimonialRow } from "@/components/site/Testimonials";
import type { ReviewRow } from "@/components/site/Reviews";
import type { FaqRow } from "@/components/site/Faq";

export type ServiceDetail = ServiceRow & {
  slug: string;
  body: string;
  meta_title: string;
  meta_description: string;
  updated_at: string;
};

export const getServices = () =>
  cached(["services", "visible"], [TAGS.services], () =>
    query<ServiceDetail>("SELECT * FROM services WHERE visible = 1 ORDER BY sort_order, id"),
  );

export const getServiceBySlug = (slug: string) =>
  cached(["service", slug], [TAGS.services], async () => {
    const rows = await query<ServiceDetail>("SELECT * FROM services WHERE visible = 1 AND slug = ? LIMIT 1", [slug]);
    return rows[0] ?? null;
  });

export const getProjects = () =>
  cached(["projects", "visible"], [TAGS.projects], () =>
    query<ProjectRow>("SELECT * FROM projects WHERE visible = 1 ORDER BY sort_order, id"),
  );

export const getTestimonials = () =>
  cached(["testimonials", "visible"], [TAGS.testimonials], () =>
    query<TestimonialRow>("SELECT * FROM testimonials WHERE visible = 1 ORDER BY sort_order, id"),
  );

export const getReviews = () =>
  cached(["reviews", "visible"], [TAGS.reviews], () =>
    query<ReviewRow>("SELECT * FROM reviews WHERE visible = 1 ORDER BY featured DESC, sort_order, id"),
  );

export const getFaqs = () =>
  cached(["faqs", "visible"], [TAGS.faqs], () =>
    query<FaqRow>("SELECT * FROM faqs WHERE visible = 1 ORDER BY sort_order, id"),
  );

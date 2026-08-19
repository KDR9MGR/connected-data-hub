import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mergeWithDefaults } from "./pageContentSchema";

export function usePageSection(page: string, section: string) {
  const query = useQuery({
    queryKey: ["page_content", page, section],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("content")
        .eq("page", page)
        .eq("section", section)
        .maybeSingle();
      if (error) throw error;
      return (data?.content as Record<string, unknown>) ?? null;
    },
    staleTime: 30_000,
  });

  return { content: mergeWithDefaults(page, section, query.data), isLoading: query.isLoading };
}

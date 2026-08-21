import { usePageSection } from "@/lib/usePageContent";

export const HEADING_FONT_OPTIONS = [
  "Cormorant Garamond",
  "Playfair Display",
  "Fraunces",
  "DM Serif Display",
  "Libre Baskerville",
];

export function ThemeStyle() {
  const { content } = usePageSection("global", "theme");
  return (
    <style>{`:root {
  --sage: ${content.accent_color};
  --cream: ${content.background_color};
  --font-serif: '${content.heading_font}', ui-serif, Georgia, serif;
}`}</style>
  );
}

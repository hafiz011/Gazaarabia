import { ReactNode } from "react";

interface CollectionPageSchemaProps {
  name: string;
  description?: string;
  url: string;
  imageUrl?: string;
}

export function CollectionPageSchema({
  name,
  description,
  url,
  imageUrl,
}: CollectionPageSchemaProps): ReactNode {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description: description || `${name} collection from GAZAARABIA`,
    url,
    ...(imageUrl && { image: imageUrl }),
    publisher: {
      "@type": "Organization",
      name: "GAZAARABIA",
      url: "https://gazaarabia.com",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

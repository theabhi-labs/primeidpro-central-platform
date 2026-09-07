import React, { useEffect } from 'react';

export default function SEO({
  title = 'Prime ID Pro – Photo Processing & Printing Software',
  description = 'Prime ID Pro is an automated photo processing and high-speed desktop printing software for CSC centers, cyber cafes, photo studios, and printing businesses.',
  canonical = 'https://primeidpro.online',
  ogType = 'website'
}) {
  useEffect(() => {
    // 1. Set Title
    document.title = title;

    // 2. Set Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. Set Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);

    // 4. Open Graph Tags
    const setMetaTag = (property, content) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setMetaTag('og:title', title);
    setMetaTag('og:description', description);
    setMetaTag('og:url', canonical);
    setMetaTag('og:type', ogType);
    setMetaTag('og:site_name', 'Prime ID Pro');

    // 5. Twitter Card Tags
    const setTwitterTag = (name, content) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setTwitterTag('twitter:card', 'summary_large_image');
    setTwitterTag('twitter:title', title);
    setTwitterTag('twitter:description', description);
  }, [title, description, canonical, ogType]);

  return null;
}

import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';

// Improved highlighting function that works both in search results and detailed view
export const highlightText = (text, searchQuery) => {
  if (!searchQuery || typeof text !== "string") return text;

  // Escape special characters in the search query
  const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Create a regex that can match the search term more broadly
  // This looks for the search term in text content, not just between specific tags
  const regex = new RegExp(`(${escapedQuery})`, 'gi');

  // First, split the HTML into parts that are inside tags and parts that are text content
  const parts = [];
  let inTag = false;
  let currentPart = '';

  for (let i = 0; i < text.length; i++) {
    if (text[i] === '<') {
      if (currentPart) {
        parts.push({ isTag: inTag, content: currentPart });
        currentPart = '';
      }
      inTag = true;
      currentPart += text[i];
    } else if (text[i] === '>') {
      currentPart += text[i];
      parts.push({ isTag: inTag, content: currentPart });
      currentPart = '';
      inTag = false;
    } else {
      currentPart += text[i];
    }
  }

  if (currentPart) {
    parts.push({ isTag: inTag, content: currentPart });
  }

  // Only highlight in text parts, not in tag parts
  return parts.map(part => {
    if (part.isTag) return part.content;
    return part.content.replace(regex, '<mark>$1</mark>');
  }).join('');
};

// Main component that handles HTML parsing and section scrolling
const HtmlContentWithSections = ({ content, searchQuery, forwardURL }) => {
  const [highlightedContent, setHighlightedContent] = useState('');

  // Process content when component mounts or when searchQuery changes
  useEffect(() => {
    // Apply highlighting to the content
    const processedContent = searchQuery ? highlightText(content, searchQuery) : content;
    setHighlightedContent(processedContent);

    // Handle hash fragment for scrolling
    if (window.location.hash && window.location.hash.includes('bookmarkSection')) {
      setTimeout(() => {
        const targetId = window.location.hash.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          console.log(`Scrolled to section: ${targetId}`);
        } else {
          console.warn(`Target section not found: ${targetId}`);
        }
      }, 100); // slightly longer delay to ensure DOM is ready
    }
  }, [content, searchQuery]);

  // Debugging log to verify highlighting is being applied
  useEffect(() => {
    console.log('Search query for highlighting:', searchQuery);
    console.log('Is content highlighted:', highlightedContent.includes('<mark>'));
  }, [searchQuery, highlightedContent]);

  // Function to parse and sanitize HTML
  const parseHtmlSanitizeAddTargetToLinks = () => {
    // Allow target, rel, class, id, name, and href attributes during sanitization
    const cleanHtml = DOMPurify.sanitize(highlightedContent, {
      ADD_ATTR: ['target', 'rel', 'class', 'id', 'name', 'href'],
      ADD_TAGS: ['mark'], // Explicitly allow mark tags
    });

    return parse(cleanHtml, {
      replace: (domNode) => {
        if (!domNode || !domNode.name) return;

        // Handle title nodes
        if (domNode.name === 'title') {
          console.log(domNode.data);
        }

        // Handle footnote reference links (forward links)
        if (
          domNode.name === 'a' &&
          domNode.attribs?.href?.startsWith('#bookmark') &&
          !domNode.attribs?.href?.includes('back') &&
          !domNode.attribs?.href?.includes('Section')
        ) {
          return (
            <a
              href={domNode.attribs.href}
              className={domNode.attribs.class}
              id={domNode.attribs.id}
              onClick={(e) => {
                e.preventDefault();
                const targetId = domNode.attribs.href.substring(1); // Remove #
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                  targetElement.scrollIntoView({ behavior: 'smooth' });
                } else {
                  console.warn(`Target not found: ${targetId}`);
                }
              }}
            >
              {domNode.children?.map((child, index) => {
                if (child?.name === 'mark') {
                  return (
                    <mark key={index}>
                      {child?.children?.map((subChild) => subChild?.data).join('')}
                    </mark>
                  );
                }
                return child?.data || '';
              })}
            </a>
          );
        }

        // Handle footnote return links (backlinks)
        if (
          domNode.name === 'a' &&
          domNode.attribs?.href?.startsWith('#bookmarkback')
        ) {
          return (
            <a
              href={domNode.attribs.href}
              className={domNode.attribs.class}
              id={domNode.attribs.id}
              onClick={(e) => {
                e.preventDefault();
                const targetId = domNode.attribs.href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                  targetElement.scrollIntoView({ behavior: 'smooth' });
                } else {
                  console.warn(`Backlink target not found: ${targetId}`);
                }
              }}
            >
              {domNode.children?.map((child, index) => {
                if (child?.name === 'mark') {
                  return (
                    <mark key={index}>
                      {child?.children?.map((subChild) => subChild?.data).join('')}
                    </mark>
                  );
                }
                return child?.data || '';
              })}
            </a>
          );
        }

        // Handle section links like #bookmarkSection5.1
        if (
          domNode.name === 'a' &&
          domNode.attribs?.href &&
          domNode.attribs.href.includes('bookmarkSection')
        ) {
          return (
            <a
              href={domNode.attribs.href}
              className={domNode.attribs.class}
              id={domNode.attribs.id}
              onClick={(e) => {
                e.preventDefault(); // Prevent default link behavior

                const sectionId = domNode.attribs.href; // e.g., #bookmarkSection2.1
                const isPreviewMode = window.location.pathname.includes('/search');

                console.log('Link clicked in preview mode:', isPreviewMode);

                if (isPreviewMode) {
                  try {
                    // Check if localStorage is accessible
                    if (typeof localStorage !== 'undefined') {
                      console.log('localStorage before access:', Object.keys(localStorage));

                      // Get the URL from localStorage
                      const storageURL = localStorage.getItem('localURL') || '';
                      console.log('Retrieved storageURL:', storageURL);

                      if (storageURL) {
                        const fullGuideUrl = `${storageURL}${sectionId}`;
                        console.log('Opening URL:', fullGuideUrl);

                        // Open in a new tab
                        const newTab = window.open(fullGuideUrl, '_blank');

                        // Use setTimeout to ensure the opening completes before clearing
                        if (newTab) {
                          setTimeout(() => {
                            try {
                              // Store important data before clearing
                              const dataToKeep = {};

                              // Only remove the specific item we used
                              localStorage.removeItem('localURL');
                              console.log('localURL removed from localStorage');

                              // Verify removal
                              console.log('After removal, localStorage has:', Object.keys(localStorage));
                            } catch (clearErr) {
                              console.error('Error removing from localStorage:', clearErr);
                            }
                          }, 1000); // Longer timeout for production environment
                        }
                      } else {
                        console.warn('localURL is missing in localStorage.');
                      }
                    } else {
                      console.error('localStorage is not available');
                    }
                  } catch (err) {
                    console.error('Error in preview mode handling:', err);
                  }
                } else {
                  // Open the section link in a new tab
                  try {
                    const fullUrl = `${window.location.origin}${window.location.pathname}${sectionId}`;
                    console.log('Opening regular URL:', fullUrl);

                    const newTab = window.open(fullUrl, '_blank');

                    if (!newTab || newTab.closed) {
                      // If the new tab didn't open, then scroll in the current tab
                      const targetId = sectionId.substring(1); // Remove #
                      console.log('Attempting to scroll to:', targetId);

                      const targetElement = document.getElementById(targetId);
                      if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        console.warn(`Target element not found: ${targetId}`);
                      }
                    }
                  } catch (err) {
                    console.error('Error in regular mode handling:', err);
                  }
                }
              }}
            >
              {domNode.children?.map((child, index) => {
                if (child?.name === 'mark') {
                  return (
                    <mark key={index}>
                      {child?.children?.map((subChild) => subChild?.data).join('')}
                    </mark>
                  );
                }
                return child.data || '';
              })}
            </a>
          );
        }

        // Handle <a name="bookmark1">...</a> by replacing `name` with `id`
        if (domNode.name === 'a' && domNode.attribs?.name) {
          return (
            <a id={domNode.attribs.name}>
              {domNode.children?.map((child, index) => {
                if (child?.name === 'mark') {
                  return (
                    <mark key={index}>
                      {child?.children?.map((subChild) => subChild?.data).join('')}
                    </mark>
                  );
                }
                return child?.data || '';
              })}
            </a>
          );
        }

        // Handle external links (open in new tab)
        if (domNode.name === 'a' && !domNode.attribs?.href?.startsWith('#')) {
          return (
            <a
              href={domNode.attribs.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                window.open(domNode.attribs.href, '_blank', 'noopener noreferrer');
              }}
            >
              {domNode.children?.map((child, index) => {
                if (child?.name === 'mark') {
                  return (
                    <mark key={index}>
                      {child?.children?.map((subChild) => subChild?.data).join('')}
                    </mark>
                  );
                }
                return child?.data || '';
              })}
            </a>
          );
        }

        // Default handling for remaining <a> tags
        if (domNode.name === 'a' && domNode.attribs) {
          return (
            <a href={domNode.attribs.href} rel="noopener noreferrer">
              {domNode.children?.map((child, index) => {
                if (child?.name === 'mark') {
                  return (
                    <mark key={index}>
                      {child?.children?.map((subChild) => subChild?.data).join('')}
                    </mark>
                  );
                }
                return child?.data || '';
              })}
            </a>
          );
        }
      },
    });
  };

  return <div className="html-content">{parseHtmlSanitizeAddTargetToLinks()}</div>;
};

export default HtmlContentWithSections;

// Maintaining the original export pattern for the parse function
export const parseHtmlSanitizeAddTargetToLinks = (content, searchQuery, forwardURL) => {
  console.log("parseHtmlSanitizeAddTargetToLinks called with search query:", searchQuery);
  console.log("The forward URL is:", forwardURL);

  const component = <HtmlContentWithSections content={content} searchQuery={searchQuery} forwardURL={forwardURL} />;
  return component;
};

// Helper function for deep copying objects
export const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};
export const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}
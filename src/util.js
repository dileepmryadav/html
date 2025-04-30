import React, { useEffect } from 'react';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';



// Helper function for highlighting text
export const highlightText = (text, searchQuery) => {
  if (!searchQuery || typeof text !== "string") return text;

  // Convert search query to a safe regex pattern (escape special characters)
  const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Regex to match text **outside HTML tags only**
  const regex = new RegExp(`(>[^<>]*)(${escapedQuery})([^<>]*<)`, 'gi');

  return text.replace(regex, (match, before, word, after) => {
    return `${before}<mark>${word}</mark>${after}`;
  });
};



// Main component that handles HTML parsing and section scrolling
const HtmlContentWithSections = ({ content, searchQuery }) => {
  // Check if the page loaded with a section fragment
  useEffect(() => {
    // This runs when the component mounts
    if (window.location.hash && window.location.hash.includes('bookmarkSection')) {
      // Give the DOM time to fully render
      setTimeout(() => {
        const targetId = window.location.hash.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          console.log(`Scrolled to section: ${targetId}`);
        } else {
          console.warn(`Target section not found: ${targetId}`);
        }
      }, 50); // delay to ensure DOM is ready
    }
  }, []);

  // Function to parse and sanitize HTML
  const parseHtmlSanitizeAddTargetToLinks = () => {
    // Allow target, rel, class, id, and name attributes during sanitization
    const cleanHtml = DOMPurify.sanitize(highlightText(content, searchQuery), {
      ADD_ATTR: ['target', 'rel', 'class', 'id', 'name', 'href'],
    });

    // Get the current page URL without fragment
    const currentPageUrl = window.location.href.split('#')[0];

    return parse(cleanHtml, {
      replace: (domNode) => {
        if (!domNode || !domNode.name) return;

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
                e.preventDefault();

                // Open in new tab with section reference
                const fullUrl = `${currentPageUrl}${domNode.attribs.href}`;
                window.open(fullUrl, '_blank');
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

// If you prefer to keep your original export pattern for the parse function
export const parseHtmlSanitizeAddTargetToLinks = (content, searchQuery) => {
  // This is for backward compatibility
  const tempDiv = document.createElement('div');
  const component = <HtmlContentWithSections content={content} searchQuery={searchQuery} />;
  // Note: In a real implementation, you'd need to use ReactDOM to render this
  // This is just a placeholder to maintain API compatibility
  return component;
};

// Helper function for deep copying objects
export const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};


// import DOMPurify from 'dompurify'
// import parse from 'html-react-parser'

// export const highlightText = (text, searchQuery) => {
//   if (!searchQuery) return text
//   const regex = new RegExp(`(${searchQuery})`, 'gi')
//   return text?.replace(regex, '<mark>$1</mark>')
// }
// export const parseHtmlSanitizeAddTargetToLinks = (content, searchQuery) =>{
//   // Allow target and rel attributes during sanitization
//   const cleanHtml = DOMPurify.sanitize(highlightText(content, searchQuery), {
//     ADD_ATTR: ['target', 'rel'], // Add target and rel to allowed attributes
//   })

//   return parse(cleanHtml, {
//     replace: (domNode) => {
//       // Handle <a> tags with href starting with '#', internal links: : <sup><a href='#bookmark1'>[1]</a></sup>, convention to create internal page links:
//       // expectedFrom: <sup><a class='s15' href='#bookmark1'>[1]</a></sup>         class='s15' class attribute is optional
//       // expectedTo: <strong><sup><a name='bookmark1'>[1]</a></sup></strong>  strong attribute  if you want to keep bold text
//       if (
//         domNode?.name === 'a' &&
//         domNode.attribs &&
//         domNode.attribs.href?.startsWith('#')
//       ) {
//         return (
//           <a className={domNode.attribs.class} href={domNode.attribs.href}>
//             {domNode.children?.map((child) => child?.data || '')}
//           </a>
//         )
//       }

//       // Handle <a> tags with target="_blank", links which we want to open in new tab
//       if (
//         domNode?.name === 'a' &&
//         domNode.attribs &&
//         domNode.attribs.target === '_blank'
//       ) {
//         return (
//           <a
//             href={domNode.attribs.href}
//             target='_blank'
//             rel='noopener noreferrer'
//           >
//             {domNode.children?.map((child) => child?.data || '')}
//           </a>
//         )
//       }

//       // Handle <a name="bookmark1">...</a> by replacing `name` with `id`, handling referced links <strong><sup><a name='bookmark1'>[1]</a></sup></strong>
//       if (domNode?.name === 'a' && domNode.attribs?.name) {
//         return (
//           <a id={domNode.attribs.name}>
//             {domNode.children?.map((child) => child?.data || '')}
//           </a>
//         )
//       }
//       // Handle the specific case of <sup><a ...></a></sup> or <strong><sup><a ...></a></sup>
//       // if (
//       //   domNode?.name === 'sup' ||
//       //   domNode?.name === 'strong' ||
//       //   domNode?.name === 'a'
//       // ) {
//       //   return (
//       //     <domNode.type {...domNode.attribs}>
//       //       {domNode.children?.map((child, idx) => (
//       //         <child.type key={idx} {...child.attribs}>
//       //           {child.data ||
//       //             child.children?.map((grandChild) => grandChild.data)}
//       //         </child.type>
//       //       ))}
//       //     </domNode.type>
//       //   )
//       // }

//       // Default handling for <a> tags without target="_blank" or special cases
//       if (domNode?.name === 'a' && domNode.attribs) {
//         return (
//           <a href={domNode.attribs.href} rel='noopener noreferrer'>
//             {domNode.children?.map((child) => child?.data || '')}
//           </a>
//         )
//       }
//     },
//   })
// }

// export const deepCopy = (obj) => {
//   return JSON.parse(JSON.stringify(obj))
// }

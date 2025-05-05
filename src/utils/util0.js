import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';

export const highlightText = (text, searchQuery) => {
    if (!searchQuery || typeof text !== "string") return text;

    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const regex = new RegExp(`(${escapedQuery})`, 'gi');

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

    return parts.map(part => {
        if (part.isTag) return part.content;
        return part.content.replace(regex, '<mark>$1</mark>');
    }).join('');
};

const HtmlContentWithSections = ({ content, searchQuery, forwardURL }) => {
    const [highlightedContent, setHighlightedContent] = useState('');

    useEffect(() => {
        const processedContent = searchQuery ? highlightText(content, searchQuery) : content;
        setHighlightedContent(processedContent);

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
            }, 100);
        }
    }, [content, searchQuery]);

    useEffect(() => {
        console.log('Search query for highlighting:', searchQuery);
        console.log('Is content highlighted:', highlightedContent.includes('<mark>'));
    }, [searchQuery, highlightedContent]);

    const parseHtmlSanitizeAddTargetToLinks = () => {
        const cleanHtml = DOMPurify.sanitize(highlightedContent, {
            ADD_ATTR: ['target', 'rel', 'class', 'id', 'name', 'href'],
            ADD_TAGS: ['mark'],
        });

        return parse(cleanHtml, {
            replace: (domNode) => {
                if (!domNode || !domNode.name) return;

                if (domNode.name === 'title') {
                    console.log(domNode.data);
                }

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
                                const targetId = domNode.attribs.href.substring(1);
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

                                const sectionId = domNode.attribs.href;
                                const isPreviewMode = window.location.pathname.includes('/search');

                                console.log('Link clicked in preview mode:', isPreviewMode);

                                if (isPreviewMode) {
                                    try {
                                        if (typeof localStorage !== 'undefined') {
                                            console.log('localStorage before access:', Object.keys(localStorage));

                                            const storageURL = localStorage.getItem('localURL') || '';
                                            console.log('Retrieved storageURL:', storageURL);

                                            if (storageURL) {
                                                const fullGuideUrl = `${storageURL}${sectionId}`;
                                                console.log('Opening URL:', fullGuideUrl);

                                                const newTab = window.open(fullGuideUrl, '_blank');

                                                if (newTab) {
                                                    setTimeout(() => {
                                                        try {
                                                            const dataToKeep = {};

                                                            localStorage.removeItem('localURL');
                                                            console.log('localURL removed from localStorage');

                                                            console.log('After removal, localStorage has:', Object.keys(localStorage));
                                                        } catch (clearErr) {
                                                            console.error('Error removing from localStorage:', clearErr);
                                                        }
                                                    }, 1000);
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
                                    try {
                                        const fullUrl = `${window.location.origin}${window.location.pathname}${sectionId}`;
                                        console.log('Opening regular URL:', fullUrl);

                                        const newTab = window.open(fullUrl, '_blank');

                                        if (!newTab || newTab.closed) {
                                            const targetId = sectionId.substring(1);
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

export const parseHtmlSanitizeAddTargetToLinks = (content, searchQuery, forwardURL) => {
    console.log("parseHtmlSanitizeAddTargetToLinks called with search query:", searchQuery);
    console.log("The forward URL is:", forwardURL);

    const component = <HtmlContentWithSections content={content} searchQuery={searchQuery} forwardURL={forwardURL} />;
    return component;
};


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
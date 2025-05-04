import React, { useState, useEffect, useCallback, useRef } from 'react'
import Modal from '@mui/material/Modal'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import CloseIcon from '@mui/icons-material/Close'
// import { handleOpenInNewTab } from '../../services/articleCardHandlers'
import { Fab, Zoom, Tooltip } from '@mui/material'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import {
    Box,
    Button,
    Typography,
    Paper,
    IconButton,
    useMediaQuery,
    useTheme,
    Snackbar,
    Alert, Chip
} from '@mui/material'

import { parseHtmlSanitizeAddTargetToLinks } from '../utils/util2'
// import { parseHtmlSanitizeAddTargetToLinks } from '../../services/utils'
// import GuideArticle from './GuideArticle'


import html from './content.html';



// Define guide type colors
const guideTypeColors = {
    'GUIDE - Federal Tax Authority Guide': {
        main: '#3f51b5', // Blue for FTA guides
        light: '#e8eaf6',
    },
    'GUIDE - Ministry of Finance Guide': {
        main: '#2e7d32', // Green for MoF guides
        light: '#e8f5e9',
    },
    'PC - Public Clarification': {
        main: '#f44336', // Red for Public Clarifications
        light: '#ffebee',
    },
    'MANUAL - User Manual': {
        main: '#ff9800', // Orange for Cabinet Decisions
        light: '#fff3e0',
    },
    // Default color for any other types
    default: {
        main: '#9e9e9e', // Grey
        light: '#f5f5f5',
    },
}

// Helper function to get color based on guide type
const getGuideTypeColor = (type) => {
    return guideTypeColors[type] || guideTypeColors.default;
};

const GuideCard = ({ article, searchQuery }) => {
    const theme = useTheme()
    const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'))
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'))

    const [open, setOpen] = React.useState(false);

    const [showBackToTop, setShowBackToTop] = useState(false)
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('') // Feedback submitted successfully 😄
    const [snackbarSeverity, setSnackbarSeverity] = useState('success') // success or error

    const modalContentRef = useRef(null)

  
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

        // Theme colors
    const themeColors = {
        primary: '#232536',
        secondary: '#ffcf51',
        hover: '#3a3e5a',
    }

    // Get colors based on guide type
    const typeColors = getGuideTypeColor(article?.type)

    const buttonBorderRadius = '28px'

    // const handleModalToggle = useCallback(() => {
    //     setModalIsOpen((prev) => !prev)
    // }, [])
    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') return
        setSnackbarOpen(false)
    }

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message)
        setSnackbarSeverity(severity)
        setSnackbarOpen(true)
    }
    // Set up scroll detection with direct DOM approach
    useEffect(() => {
        // Only run this if modal is open
        // if (!modalIsOpen) return

        // Use requestAnimationFrame for smoother detection
        let scrollFrame
        const checkScroll = () => {
            if (modalContentRef.current) {
                // Check if scrolled down enough
                setShowBackToTop(modalContentRef.current.scrollTop > 300)
            }
            // Continue checking
            scrollFrame = requestAnimationFrame(checkScroll)
        }

        // Start the animation frame loop
        scrollFrame = requestAnimationFrame(checkScroll)

        // Add a basic scroll listener as backup
        const handleScroll = () => {
            if (modalContentRef.current) {
                setShowBackToTop(modalContentRef.current.scrollTop > 300)
            }
        }

        // Get the modal element
        const modalElement = modalContentRef.current
        if (modalElement) {
            modalElement.addEventListener('scroll', handleScroll)
        }

        // Clean up
        return () => {
            cancelAnimationFrame(scrollFrame)
            if (modalElement) {
                modalElement.removeEventListener('scroll', handleScroll)
            }
        }
    }, [
        // modalIsOpen

    ])

    // Function to scroll modal to top
    const scrollToTop = useCallback(() => {
        if (modalContentRef.current) {
            modalContentRef.current.scrollTo({
                top: 0,
                behavior: 'smooth',
            })
        }
    }, [])
    // Truncate long text
    // const truncateText = (text, maxLength) => {
    //   if (!text) return ''
    //   if (text.length <= maxLength) return text
    //   return text.slice(0, maxLength) + '...'
    // }

    // TODO1: updated version of truncateText is present only in ArticleCard and not in DecisionCard, GuideCard, TaxTreatyCard
    // issue: any html code should be ignored while displaying text of title/name/country2Name,  for e.g. "Article 26 - <a href='/decisions/uae-cit-fdl-47-2022-md-132-of-2023' target='_blank' rel='noopener noreferrer'>Transfers Within a Qualifying Group</a>" so this should be considered as ""Article 26 - Transfers Within a Qualifying Group" before using slicing,  but we dont want to remove the effect html tags were giving like bold italic text color change etc
    // TODO2: also tooltip should not show html code while hovering over title
    const truncateText = (html, maxLength) => {
        if (!html) return ''

        const div = document.createElement('div')
        div.innerHTML = html

        let visibleCount = 0
        let truncated = ''

        const walk = (node) => {
            if (visibleCount >= maxLength) return

            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent
                const remaining = maxLength - visibleCount

                if (text.length <= remaining) {
                    truncated += text
                    visibleCount += text.length
                } else {
                    truncated += text.slice(0, remaining) + '...'
                    visibleCount = maxLength
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                truncated += `<${node.nodeName.toLowerCase()}${[...node.attributes]
                    .map((attr) => ` ${attr.name}="${attr.value}"`)
                    .join('')}>`
                for (let child of node.childNodes) walk(child)
                truncated += `</${node.nodeName.toLowerCase()}>`
            }
        }

        for (let child of div.childNodes) {
            if (visibleCount < maxLength) walk(child)
        }

        return truncated
    }

    // Calculate card height based on screen size
    const cardHeight = isMobileScreen
        ? '110px' // smaller screen
        : isMediumScreen
            ? '140px' // medium screen
            : '130px' // large screen

    const truncatedTitle = truncateText(article?.title, isMobileScreen ? 90 : 120)

    const showTitleTooltip =
        article?.title && article.title.length > (isMobileScreen ? 90 : 120)

    // Format the year for display
    const displayYear = article?.year ? `${article.year}` : ''

    // Get short type label for the chip
    const getTypeLabel = (type) => {
        if (!type) return 'Guide'

        if (type.includes('GUIDE - Federal Tax Authority Guide')) return 'Guideline'
        if (type.includes('PC - Public Clarification')) return 'PC'
        if (type.includes('MANUAL - User Manual')) return 'Manual'
        // if (type.includes('Ministry of Finance')) return 'MoF Guide'

        // Default to just "Guide" if none of the above
        return 'Guide'
    }



    const handleOpenInNewTab = (article, path) => {
        if (!article || !path) return;

        const url = `${window.location.origin}${path}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };


    useEffect(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://gtlcdnstorage.blob.core.windows.net/guide/stylesheets/guide.css";
        link.id = "external-css";
        if (!document.getElementById("external-css")) {
            document.head.appendChild(link);
        }

        return () => {
            document.getElementById("external-css")?.remove(); // Cleanup on unmount
        };

    }, []);

    return (
        <>
            <Paper
                sx={{
                    margin: 2,
                    padding: 2,
                    // height: cardHeight,

                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        transform: 'translateY(-2px)',
                    },
                    borderLeft: `5px solid ${typeColors.main}`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(90deg, ${typeColors.light} 0%, rgba(255,255,255,0) 50%)`,
                        opacity: 0.5,
                        zIndex: 0,
                        pointerEvents: 'none',
                    },
                }}
                id={`article-${article?.slug}`}
            >

                {/* <Button onClick={handleOpen}>Open modal</Button> */}
                <Box
                onClick={handleOpen}
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        // alignItems: 'flex-start',
                        width: '100%',
                        zIndex: 1,
                        position: 'relative',
                    }}
                >
                    <Box
                    onClick={handleOpen}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between', // 'center'
                            flexGrow: 1,
                            overflow: 'hidden',
                            mr: isMobileScreen ? 1 : 2,
                            height: '100%',
                        }}
                    >
                        
                        <Tooltip
                            // title={showTitleTooltip ? article?.title : ''}
                            title={article?.title}
                            arrow
                            placement='bottom'
                        >
                            
                            <Typography
                                variant={isMobileScreen ? 'subtitle1' : 'h6'}
                                onClick={handleOpen}
                                sx={{
                                    cursor: 'pointer',
                                    color: themeColors.primary,
                                    lineHeight: isMobileScreen ? 1.3 : 1.5,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    // mb: 1,
                                    fontWeight: 600,
                                    fontSize: isMobileScreen ? '1rem' : undefined,
                                    mb: 1,
                                }}
                            // dangerouslySetInnerHTML={{
                            //   __html: DOMPurify.sanitize(
                            //     highlightText(article.title, searchQuery)
                            //   ),
                            // }}
                            >
                                {parseHtmlSanitizeAddTargetToLinks(truncatedTitle, searchQuery)}

                            </Typography>
                        </Tooltip>

                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: isMobileScreen ? 'column' : 'row',
                                alignItems: isMobileScreen ? 'flex-start' : 'center',
                                gap: 1,
                                mt: 1,
                            }}
                        >
                            <Chip
                                label={getTypeLabel(article?.type)}
                                size={isMobileScreen ? 'small' : 'medium'}
                                sx={{
                                    backgroundColor: typeColors.main,
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: isMobileScreen ? '0.7rem' : '0.75rem',
                                    height: isMobileScreen ? '24px' : '28px',
                                }}
                            />

                            {displayYear && (
                                <Chip
                                    label={displayYear}
                                    size={isMobileScreen ? 'small' : 'medium'}
                                    variant='outlined'
                                    sx={{
                                        borderColor: typeColors.main,
                                        color: typeColors.main,
                                        fontSize: isMobileScreen ? '0.7rem' : '0.75rem',
                                        height: isMobileScreen ? '24px' : '28px',
                                    }}
                                />
                            )}
                        </Box>
                    </Box>

                    <Box sx={{ alignSelf: 'flex-start' }}>
                        <Tooltip title='Open in new tab' arrow>
                            <IconButton
                                onClick={() =>
                                    handleOpenInNewTab(article, `/guidances/${article?.slug}`)
                                }
                                size={isMobileScreen ? 'small' : 'medium'}
                                sx={{
                                    color: themeColors.primary,
                                    // p: isMobileScreen ? 0.5 : 1,
                                    '&:hover': {
                                        backgroundColor: 'rgba(35, 37, 54, 0.08)',
                                    },
                                }}
                            >
                                <OpenInNewRoundedIcon
                                    fontSize={isMobileScreen ? 'small' : 'medium'}
                                />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
                <Modal open={open}
                    onClose={handleClose}>
                    {/* Wrapper Box to maintain border radius when scrollbar appears */}
                    <Box
                        sx={{
                            margin: '5vh auto',
                            width: isMobileScreen ? '95%' : isMediumScreen ? '90%' : '80%',
                            maxHeight: '90vh',
                            borderRadius: '8px',
                            overflow: 'hidden', // Hide any content that would break the border radius
                            position: 'relative',
                            display: 'flex', // Use flexbox
                            flexDirection: 'column', // Stack content vertically
                            backgroundColor: 'white',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                            borderLeft: `5px solid ${typeColors.main}`,
                        }}
                    >
                        {/* Content Box with scrolling */}
                        <Box
                            ref={modalContentRef}
                            sx={{
                                padding: '1px 6px 16px 6px', // Add padding inside the content area
                                paddingTop: 2,
                                position: 'relative',
                                overflowY: 'auto', // Enable vertical scrolling
                                flexGrow: 1, // Allow this box to expand
                                // Ensure scrollbar doesn't affect layout
                                scrollbarWidth: 'thin', // For Firefox
                                '&::-webkit-scrollbar': {
                                    width: '8px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    background: '#f1f1f1',
                                    borderRadius: '0 8px 8px 0', // Round the scrollbar track
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    background: '#888',
                                    borderRadius: '4px',
                                },
                                '&::-webkit-scrollbar-thumb:hover': {
                                    background: '#555',
                                },
                            }}
                        >
                            {/* Close button - positioned at top right with label */}
                            {/* RESPONSIVE CLOSE BUTTON */}
                            {isMobileScreen ? (
                                // Smaller close button for mobile
                                <IconButton
                                    onClick={handleOpen}
                                    sx={{
                                        position: 'sticky',
                                        top: 0,
                                        float: 'right',
                                        zIndex: 1500,
                                        backgroundColor: 'white',
                                        border: '1px solid #232536',
                                        margin: '-8px -8px 0 0',
                                        right: '-2px', // Use right positioning for exact alignment
                                        '&:hover': {
                                            backgroundColor: '#f5f5f5',
                                        },
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                    }}
                                    aria-label='close modal'
                                    size='small'
                                >
                                    <CloseIcon sx={{ color: '#232536' }} fontSize='small' />
                                </IconButton>
                            ) : (
                                // Larger close button with text for desktop/tablet
                                <Box
                                    sx={{
                                        position: 'sticky',
                                        cursor: 'pointer',
                                        top: 0,
                                        float: 'right',
                                        zIndex: 1500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: 'white',
                                        border: '1px solid #232536',
                                        borderRadius: buttonBorderRadius,
                                        margin: '-4px -4px 0 0',
                                        right: 0,
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                        '&:hover': {
                                            backgroundColor: '#f5f5f5',
                                        },
                                        padding: '4px 12px',
                                    }}
                                    onClick={handleOpen}
                                    role='button'
                                    aria-label='close modal'
                                >
                                    <CloseIcon
                                        sx={{ color: themeColors.primary }}
                                        fontSize='small'
                                    />
                                    <Box sx={{ alignSelf: 'center' }}>
                                        <Typography
                                            variant='button'
                                            sx={{
                                                color: themeColors.primary,
                                                marginLeft: 0.5,
                                                fontSize: '0.80rem',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            Close
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                            {/* Guide type chip in modal */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 1,
                                    mt: isMobileScreen ? 4 : 2,
                                    mb: 2,
                                    ml: 2,
                                }}
                            >
                                <Chip
                                    label={article?.type || 'Guide'}
                                    size='medium'
                                    sx={{
                                        backgroundColor: typeColors.main,
                                        color: 'white',
                                        fontWeight: 600,
                                        px: 1,
                                    }}
                                />

                                {displayYear && (
                                    <Chip
                                        label={displayYear}
                                        variant='outlined'
                                        sx={{
                                            borderColor: typeColors.main,
                                            color: typeColors.main,
                                        }}
                                    />
                                )}
                            </Box>
                            {/* <GuideArticle
                                article={article}
                                searchQuery={searchQuery}
                                showSnackbar={showSnackbar}
                                isInModal={true}
                                parentContainerRef={modalContentRef}
                            /> */}

                            {/* Back to top button - positioned at bottom right with text label */}
                            <Box
                                sx={{
                                    position: 'sticky',
                                    bottom: isMobileScreen ? 20 : 25,
                                    // right: -2,
                                    float: 'right',
                                    marginTop: '-60px',
                                    zIndex: 1400,
                                }}
                            >
                                <Zoom in={showBackToTop}>
                                    {isMobileScreen ? (
                                        // Small circular Fab for mobile
                                        <Fab
                                            size='small'
                                            aria-label='Scroll back to top'
                                            onClick={scrollToTop}
                                            sx={{
                                                backgroundColor: '#232536',
                                                color: 'white',
                                                '&:hover': { backgroundColor: '#3a3e5a' },
                                            }}
                                        >
                                            <KeyboardArrowUpIcon fontSize='small' />
                                        </Fab>
                                    ) : (
                                        // Extended Fab with text for desktop/tablet
                                        <Fab
                                            variant='extended'
                                            size='medium'
                                            aria-label='Scroll back to top'
                                            onClick={scrollToTop}
                                            sx={{
                                                backgroundColor: themeColors.primary,
                                                color: 'white',
                                                '&:hover': { backgroundColor: themeColors.hover },
                                                paddingLeft: 2,
                                                paddingRight: 2,
                                                borderRadius: buttonBorderRadius,
                                            }}
                                        >
                                            <KeyboardArrowUpIcon sx={{ mr: 1 }} />
                                            <Typography
                                                variant='button'
                                                sx={{
                                                    // color: themeColors.primary,
                                                    // marginLeft: 0.5,
                                                    // fontSize: '0.80rem',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                Back to Top
                                            </Typography>
                                        </Fab>
                                    )}
                                </Zoom>
                                    {parseHtmlSanitizeAddTargetToLinks(html, "")}
                            </Box>
                        </Box>
                    </Box>
                </Modal>
            </Paper>
            {/* Snackbar outside of Modal */}
            {/* <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    sx={{
                        width: '100%',
                        // backgroundColor:
                        //   snackbarSeverity === 'warning'
                        //     ? '#ffcf51'
                        //     : snackbarSeverity === 'error'
                        //     ? '#d32f2f'
                        //     : snackbarSeverity === 'success'
                        //     ? '#43a047'
                        //     : '#232536',
                        // color: snackbarSeverity === 'warning' ? '#232536' : '#fff',
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar> */}
        </>
    )
}
export default GuideCard
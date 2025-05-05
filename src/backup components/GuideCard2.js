import React, { useState, useEffect, useCallback, useRef } from 'react'
import Modal from '@mui/material/Modal'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Paper,
  IconButton,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Typography,
  Chip,
  Tooltip,
  Fab,
  Zoom,
  Snackbar,
  Alert,
} from '@mui/material'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import article from '../components/article.json'
import { parseHtmlSanitizeAddTargetToLinks } from '../utils/util2'



  
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



const GuideCard = ({ searchQuery }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  // --- NEW STATE TO HOLD OUR FETCHED CONTENT ---
  const [apiContent, setApiContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // your existing open/modal state
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  // helper to show snackbars
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }
  const handleSnackbarClose = () => setSnackbar(prev => ({ ...prev, open: false }))

  // --- NEW: fetch API content as soon as `open` flips to true ---
  useEffect(() => {
    if (!open) return

    setLoading(true)
    setError(null)

    fetch(`https://testgcctaxlaws.com/api/v1/guidelines/slug/${article.slug}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        // assuming the API returns { content: '<h1>…</h1>' }
        setApiContent(data.content || '')
      })
      .catch((err) => {
        console.error(err)
        setError(err)
        showSnackbar('Failed to load guide content', 'error')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [open, article.slug])












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




  // ... rest of your component (styles, truncateText etc.)

  return (
    <>
      <Paper onClick={handleOpen} /* …your existing card props… */>
        {/* …card summary UI… */}
      </Paper>

      <Modal open={open} onClose={handleClose}>
        <Box /* …modal container styles… */>
          {/* …header, close button, chips etc.… */}

          <Box
            sx={{
              overflowY: 'auto',
              padding: 2,
              position: 'relative',
              flexGrow: 1,
            }}
          >
            {/* loading / error / content */}
            {loading && (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            )}
            {error && (
              <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>
                Unable to load content.
              </Typography>
            )}
            {!loading && !error && apiContent && (
              parseHtmlSanitizeAddTargetToLinks(apiContent, searchQuery)
            )}

            {/* back to top fab… */}
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  )
}

export default GuideCard

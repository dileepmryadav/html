import React, { useState, useEffect, useCallback, useRef } from 'react'
import Modal from '@mui/material/Modal'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import CloseIcon from '@mui/icons-material/Close'
import { Fab, Zoom, Tooltip } from '@mui/material'
import article from '../components/article.json'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import {
  Box,
  Typography,
  Paper,
  IconButton,
  useMediaQuery,
  useTheme,
  Chip,
} from '@mui/material'
import { parseHtmlSanitizeAddTargetToLinks } from '../utils/util2'

// ─── HARDCODED API RESPONSE ────────────────────────────────────────────────────
const HARDCODED_CONTENT = `<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Small Business Relief - August 2023</title><link rel='stylesheet' href='https://gtlcdnstorage.blob.core.windows.net/guide/stylesheets/guide.css'></head><body><div class='scope'><header><h1>Small Business Relief</h1><h2>Corporate Tax Guide | CTGSBR1</h2><h2>August 2023</h2></header><main><section class='index'><h3>Contents</h3><p><a href='#bookmarkSection1'>1. Glossary</a></p><p><a href='#bookmarkSection2'>2. Introduction</a></p><ol><li><p><a href='#bookmarkSection2.1'>2.1. Overview</a></p><ol><li><p><a href='#bookmarkSection2.1.1'>2.1.1. Short brief</a></p><p><a href='#bookmarkSection2.1.2'>2.1.2. Purpose of the guide</a></p><p><a href='#bookmarkSection2.1.3'>2.1.3. Who should read this guide?</a></p><p>`  
// …and so on; paste the full HTML body here  

// ─── GUIDE CARD COMPONENT ────────────────────────────────────────────────────
const GuideCard = ({ searchQuery }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  const [showBackToTop, setShowBackToTop] = useState(false)
  const modalRef = useRef(null)
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  // We no longer fetch—just use the constant
  const apiContent = HARDCODED_CONTENT

  const typeColors = {
    'GUIDE - Federal Tax Authority Guide': { main: '#3f51b5', light: '#e8eaf6' },
    'GUIDE - Ministry of Finance Guide':    { main: '#2e7d32', light: '#e8f5e9' },
    'PC - Public Clarification':           { main: '#f44336', light: '#ffebee' },
    'MANUAL - User Manual':                { main: '#ff9800', light: '#fff3e0' },
    default:                               { main: '#9e9e9e', light: '#f5f5f5' },
  }[article.type] || { main: '#9e9e9e', light: '#f5f5f5' }

  // Scroll‐detection for BackToTop button
  useEffect(() => {
    if (!open) return
    let raf
    const check = () => {
      if (modalRef.current) {
        setShowBackToTop(modalRef.current.scrollTop > 300)
      }
      raf = requestAnimationFrame(check)
    }
    raf = requestAnimationFrame(check)
    return () => cancelAnimationFrame(raf)
  }, [open])

  const scrollToTop = useCallback(() => {
    modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Truncate helper (unchanged)
  const truncateText = (html, maxLen) => {
    if (!html) return ''
    const div = document.createElement('div')
    div.innerHTML = html
    let count = 0, out = ''
    const walk = node => {
      if (count >= maxLen) return
      if (node.nodeType === Node.TEXT_NODE) {
        const txt = node.textContent
        const rem = maxLen - count
        if (txt.length <= rem) {
          out += txt; count += txt.length
        } else {
          out += txt.slice(0, rem) + '...'; count = maxLen
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        out += `<${node.nodeName.toLowerCase()}${[...node.attributes].map(a=>` ${a.name}="${a.value}"`).join('')}>`
        node.childNodes.forEach(walk)
        out += `</${node.nodeName.toLowerCase()}>`
      }
    }
    div.childNodes.forEach(walk)
    return out
  }

  const truncatedTitle = truncateText(article.title, isMobile ? 90 : 120)
  const displayYear = article.year?.toString() || ''

  return (
    <>
      <Paper
        onClick={handleOpen}
        sx={{
          m: 2, p: 2,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          borderLeft: `5px solid ${typeColors.main}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)', transform: 'translateY(-2px)' },
        }}
      >
        <Box sx={{ display:'flex', justifyContent:'space-between', zIndex:1 }}>
          <Box sx={{ flexGrow:1, cursor:'pointer' }}>
            <Tooltip title={article.title} arrow>
              <Typography
                variant={isMobile ? 'subtitle1':'h6'}
                sx={{
                  color: '#232536', fontWeight:600, lineHeight:1.5,
                  display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
                  overflow:'hidden', textOverflow:'ellipsis',
                }}
              >
                {parseHtmlSanitizeAddTargetToLinks(truncatedTitle, searchQuery)}
              </Typography>
            </Tooltip>
            <Box sx={{ mt:1, display:'flex', gap:1 }}>
              <Chip label={article.type.includes('Federal')? 'Guideline': 'Guide'} size='small'
                sx={{ bgcolor:typeColors.main, color:'#fff', fontWeight:600 }} />
              {displayYear && <Chip label={displayYear} size='small' variant='outlined' sx={{ borderColor:typeColors.main, color:typeColors.main }} />}
            </Box>
          </Box>
          <IconButton size={isMobile?'small':'medium'}>
            <OpenInNewRoundedIcon fontSize={isMobile?'small':'medium'} />
          </IconButton>
        </Box>
      </Paper>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            m:'5vh auto', width:isMobile?'95%':isMd?'90%':'80%', maxHeight:'90vh',
            bgcolor:'#fff', borderRadius:2, borderLeft:`5px solid ${typeColors.main}`,
            display:'flex', flexDirection:'column', overflow:'hidden'
          }}
        >
          {/* CLOSE BUTTON */}
          <IconButton
            onClick={handleClose}
            sx={{ position:'sticky', top:0, alignSelf:'flex-end', bgcolor:'#fff', m:1 }}
            size='small'
          >
            <CloseIcon />
          </IconButton>

          {/* CONTENT AREA */}
          <Box
            ref={modalRef}
            sx={{
              flexGrow:1, overflowY:'auto', p:2,
              '&::-webkit-scrollbar':{ width:8 },
              '&::-webkit-scrollbar-thumb':{ background:'#888', borderRadius:4 }
            }}
          >
            {parseHtmlSanitizeAddTargetToLinks(apiContent, searchQuery)}
          </Box>

          {/* BACK TO TOP */}
          <Box sx={{ position:'sticky', bottom:16, display:'flex', justifyContent:'flex-end', pr:2 }}>
            <Zoom in={showBackToTop}>
              <Fab size='small' onClick={scrollToTop} aria-label='Top'>
                <KeyboardArrowUpIcon />
              </Fab>
            </Zoom>
          </Box>
        </Box>
      </Modal>
    </>
  )
}

export default GuideCard

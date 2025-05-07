import React, { useState, useEffect, useRef } from 'react'
import { styled, useTheme, alpha } from '@mui/material/styles'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Drawer,
  Popper,
  Paper,
  Grow,
  ClickAwayListener,
  MenuList,
  Menu,
  MenuItem,
  Collapse,
  Button,
  useMediaQuery,
  Container,
  Avatar,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import GavelRoundedIcon from '@mui/icons-material/GavelRounded'
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded'
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded'
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded'
import GavelIcon from '@mui/icons-material/Gavel'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import ExploreIcon from '@mui/icons-material/Explore'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import SearchIcon from '@mui/icons-material/Search'
import { Link, useNavigate } from 'react-router-dom'

const availableLaws = [
      {
        lawFullName: 'CIT (FDL No 47 of 2022)',
        lawShortName: 'cit-fdl-47-2022',
        slug: 'uae-cit-fdl-47-2022',
      },
      {
        lawFullName: 'CIT (FDL No 60 of 2023)',
        lawShortName: 'cit-fdl-60-2023',
        slug: 'uae-cit-fdl-60-2023',
      },
      {
        lawFullName: 'VAT (FDL No 8 of 2017)',
        lawShortName: 'indirect-vat-8-2017',
        slug: 'uae-vat-fdl-8-2017',
      },
      {
        lawFullName: 'GCC VAT Agreement',
        lawShortName: 'gcc-vat-agreement',
        slug: 'uae-gcc-vat-agreement',
      },
      {
        lawFullName: 'Tax Procedures (FDL No 28 of 2022)',
        lawShortName: 'tp-fdl-28-2022',
        slug: 'uae-tp-fdl-28-2022',
      },
      {
        lawFullName: 'Excise Tax (FDL No 7 of 2017)',
        lawShortName: 'indirect-excise-7-2017',
        slug: 'uae-excise-fdl-7-2017',
      },
      {
        lawFullName: 'GCC Excise Agreement',
        lawShortName: 'gcc-excise-agreement',
        slug: 'uae-gcc-excise-agreement',
      },
    ]
// Calculate responsive drawer width
const getDrawerWidth = () => {
  const baseWidth = 280
  if (typeof window !== 'undefined') {
    const screenWidth = window.innerWidth
    if (screenWidth < 600) return Math.min(screenWidth * 0.8, baseWidth)
  }
  return baseWidth
}

// Styled components for better aesthetics
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#232536',
  boxShadow: 'none',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  position: 'relative',
  zIndex: theme.zIndex.drawer + 1,
}))

const NavLogo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}))

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.25rem',
  lineHeight: 1.2,
  color: '#fff',
  marginLeft: theme.spacing(1.5),
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    color: '#ffcf51',
  },
}))

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: getDrawerWidth(),
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: getDrawerWidth(),
    boxSizing: 'border-box',
    borderRight: 'none',
    backgroundColor: '#fafafa',
  },
}))

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  backgroundColor: '#232536',
  color: '#fff',
  minHeight: '64px',
  justifyContent: 'space-between',
}))

const MenuButton = styled(Button)(({ theme }) => ({
  color: '#fff',
  textTransform: 'none',
  padding: theme.spacing(1, 1.5),
  borderRadius: '4px',
  fontSize: '0.95rem',
  fontWeight: 500,
  letterSpacing: '0.02em',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    color: '#ffcf51',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: 0,
    height: '2px',
    backgroundColor: '#ffcf51',
    transition: 'all 0.3s ease',
  },
  '&:hover::after': {
    width: '80%',
    left: '10%',
  },
}))

const DropdownPaper = styled(Paper)(({ theme }) => ({
  minWidth: '220px',
  borderRadius: '8px',
  marginTop: '8px',
  boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
  backgroundImage: 'linear-gradient(to bottom, #fcfcfc, #f5f5f5)',
  padding: theme.spacing(1, 0),
  overflow: 'hidden',
}))


const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  margin: theme.spacing(0, 0.5),
  borderRadius: '4px',
  transition: 'all 0.2s ease',
  position: 'relative',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    paddingLeft: theme.spacing(2.5),
    // transform: 'translateX(4px)',
  },
}))

const SubMenuContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
}))

const StyledListItemButton = styled(ListItemButton)(({ theme, level = 0 }) => ({
  padding: theme.spacing(1, 2, 1, 2 + level * 2),
  borderRadius: '4px',
  margin: theme.spacing(0.5, 1),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
}))

// Hoverable dropdown menu for desktop
const NavMenuHoverable = ({ title, items, icon }) => {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)
  const navigate = useNavigate()
  const timerRef = useRef(null)
  const mouseOverRef = useRef(false)

  const handleMouseEnter = () => {
    clearTimeout(timerRef.current)
    mouseOverRef.current = true
    setOpen(true)
  }

  const handleMouseLeave = () => {
    mouseOverRef.current = false
    timerRef.current = setTimeout(() => {
      if (!mouseOverRef.current) {
        setOpen(false)
      }
    }, 300)
  }

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return
    }
    setOpen(false)
  }

  const handleLinkClick = (path) => {
    navigate(path)
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  return (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{ position: 'relative' }}
    >
      <MenuButton
        ref={anchorRef}
        aria-controls={open ? `${title}-menu` : undefined}
        aria-haspopup='true'
        onClick={handleToggle}
        endIcon={
          <ExpandMoreIcon
            sx={{
              transition: 'transform 0.2s',
              transform: open ? 'rotate(180deg)' : 'rotate(0)',
            }}
          />
        }
        startIcon={icon}
      >
        {title}
      </MenuButton>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement='bottom-start'
        transition
        disablePortal
        sx={{ zIndex: 1200 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom-start' ? 'left top' : 'left bottom',
            }}
          >
            <DropdownPaper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem={open} id={`${title}-menu`}>
                  {items.map((item) =>
                    item.subItems ? (
                      <SubMenuHoverable
                        key={item.text}
                        item={item}
                        parentOpen={open}
                        handleLinkClick={handleLinkClick}
                      />
                    ) : (
                      <StyledMenuItem
                        key={item.text}
                        onClick={() => handleLinkClick(item.link)}
                      >
                        <Typography variant='body2'>{item.text}</Typography>
                      </StyledMenuItem>
                    )
                  )}
                </MenuList>
              </ClickAwayListener>
            </DropdownPaper>
          </Grow>
        )}
      </Popper>
    </Box>
  )
}

// Hoverable submenu component
const SubMenuHoverable = ({ item, parentOpen, handleLinkClick }) => {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)
  const timerRef = useRef(null)
  const mouseOverRef = useRef(false)

  const handleMouseEnter = () => {
    clearTimeout(timerRef.current)
    mouseOverRef.current = true
    setOpen(true)
  }

  const handleMouseLeave = () => {
    mouseOverRef.current = false
    timerRef.current = setTimeout(() => {
      if (!mouseOverRef.current) {
        setOpen(false)
      }
    }, 300)
  }

  useEffect(() => {
    if (!parentOpen) {
      setOpen(false)
    }
  }, [parentOpen])

  return (
    <SubMenuContainer
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={anchorRef}
    >
      <StyledMenuItem
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: open ? alpha('#232536', 0.08) : 'transparent',
        }}
      >
        <Typography variant='body2'>{item.text}</Typography>
        <ChevronRightIcon
          fontSize='small'
          sx={{
            ml: 1,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(90deg)' : 'rotate(0)',
          }}
        />
      </StyledMenuItem>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement='right-start'
        transition
        disablePortal
        sx={{ zIndex: 1300 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: 'left top' }}>
            <DropdownPaper>
              <MenuList>
                {item.subItems.map((subItem) =>
                  subItem.subItems ? (
                    <SubMenuHoverable
                      key={subItem.text}
                      item={subItem}
                      parentOpen={open}
                      handleLinkClick={handleLinkClick}
                    />
                  ) : (
                    <StyledMenuItem
                      key={subItem.text}
                      onClick={() => handleLinkClick(subItem.link)}
                    >
                      <Typography variant='body2'>{subItem.text}</Typography>
                    </StyledMenuItem>
                  )
                )}
              </MenuList>
            </DropdownPaper>
          </Grow>
        )}
      </Popper>
    </SubMenuContainer>
  )
}

// Mobile drawer menu item with collapsible submenus
const DrawerMenuItem = ({ item, level = 0, handleDrawerClose, navigate }) => {
  const [open, setOpen] = useState(false)

  const handleToggle = () => {
    setOpen(!open)
  }

  const handleClick = () => {
    if (!item.subItems) {
      navigate(item.link)
      handleDrawerClose()
    } else {
      handleToggle()
    }
  }

  return (
    <>
      <StyledListItemButton onClick={handleClick} level={level}>
        {level === 0 && item.icon && (
          <ListItemIcon sx={{ minWidth: 36, color: '#232536' }}>
            {item.icon}
          </ListItemIcon>
        )}
        <ListItemText
          primary={item.text}
          sx={{
            '& .MuiTypography-root': {
              fontWeight: level === 0 ? 500 : 400,
              fontSize: level === 0 ? '0.95rem' : '0.9rem',
              color: '#232536',
            },
          }}
        />
        {item.subItems && (
          <Box sx={{ ml: 1 }}>
            {open ? (
              <ExpandLessIcon fontSize='small' />
            ) : (
              <ExpandMoreIcon fontSize='small' />
            )}
          </Box>
        )}
      </StyledListItemButton>

      {item.subItems && (
        <Collapse in={open} timeout='auto' unmountOnExit>
          <List component='div' disablePadding>
            {item.subItems.map((subItem) => (
              <DrawerMenuItem
                key={subItem.text}
                item={subItem}
                level={level + 1}
                handleDrawerClose={handleDrawerClose}
                navigate={navigate}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  )
}

// Default menu items
const getDefaultMenuItems = () => [
  {
    text: 'Corporate & International Tax',
    icon: <BusinessCenterIcon />,
    subItems: [
      {
        text: 'Corporate Tax',
        subItems: [
          { text: 'FDL 47 2022', link: '/search/Tax-Laws?law=cit-fdl-47-2022' },
          { text: 'FDL 60 2023', link: '/search/Tax-Laws?law=cit-fdl-60-2023' },
        ]
      },
      { text: 'Tax Treaties', link: '/search/Tax-Treaties' }
    ]
  },
  {
    text: 'Indirect Tax',
    icon: <GavelIcon />,
    subItems: [
      { text: 'FDL 7', link: '/search/Tax-Laws?law=vat-fdl-7' },
      { text: 'FDL 8', link: '/search/Tax-Laws?law=vat-fdl-8-2017' }
    ]
  },
  {
    text: 'Tax Procedures', 
    icon: <AutoStoriesIcon />,
    link: '/search/Tax-Laws?law=tp-fdl-28-2022'
  },
  {
    text: 'Search',
    icon: <SearchIcon />,
    subItems: [
      { text: 'Search Articles', link: '/search/Tax-Laws' },
      { text: 'Search Decisions', link: '/search/Decisions' },
      { text: 'Search FTA Guidance', link: '/search/Guidances' },
      { text: 'Search DTAAs', link: '/search/Tax-Treaties' },
      { text: 'Search across a Law', link: '/search' }
    ]
  },
  {
    text: 'About GTL',
    icon: <InfoOutlinedIcon />,
    subItems: [
      { text: 'About Us', link: '/about-us' },
      { text: 'Features', link: '/features' },
      { text: 'Terms & Conditions', link: '/terms-and-conditions' },
      { text: 'Privacy Policy', link: '/privacy-policy' },
      { text: 'Cookie Policy', link: '/cookie-policy' },
      { text: 'Contact Us', link: '/contact' }
    ]
  }
];
const NavBar = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [menuItems, setMenuItems] = useState(getDefaultMenuItems())
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleDrawerOpen = () => setDrawerOpen(true)
  const handleDrawerClose = () => setDrawerOpen(false)

  // Build navigation menu based on context data
  useEffect(() => {
    const defaultItems = getDefaultMenuItems()
    if (availableLaws && availableLaws.length > 0) {
      // Group laws by category
      const lawsByCategory = availableLaws.reduce((acc, law) => {
        const prefix = law.lawShortName.split('-')[0]
        if (!acc[prefix]) acc[prefix] = []
        acc[prefix].push(law)
        return acc
      }, {})

      // Create menu structure
      const corporateTaxLaws = lawsByCategory['cit'] || []
      const indirectTaxLaws = lawsByCategory['indirect'] || []
      // const taxProcedureLaws = lawsByCategory['tp'] || []

      // Complete menu structure
      if (corporateTaxLaws.length > 0) {
        defaultItems[0].subItems[0].subItems = corporateTaxLaws.map((law) => ({
          text: law.lawFullName,
          link: `/search/Tax-Laws?law=${law.lawShortName}`,
        }))
      }

      if (indirectTaxLaws.length > 0) {
        defaultItems[1].subItems = indirectTaxLaws.map((law) => ({
          text: law.lawFullName,
          link: `/search/Tax-Laws?law=${law.lawShortName}`,
        }))
      }

      // Update the menu items
      setMenuItems(defaultItems)
    }
  }, [])

  return (
    <StyledAppBar>
      <Container maxWidth='xl' disableGutters>
        <Toolbar sx={{ py: { xs: 0.5, md: 1 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
          {/* Mobile menu icon */}
          <IconButton
            color='inherit'
            aria-label='open drawer'
            onClick={handleDrawerOpen}
            edge='start'
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              color: 'white',
              '&:hover': {
                color: '#ffcf51',
                backgroundColor: 'rgba(255,255,255,0.05)',
              },
            }}
          >
            <MenuIcon />
            {/* <MenuRoundedIcon /> */}
          </IconButton>

          {/* Logo and site title */}
          <NavLogo component={Link} to='/'>
            <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'transparent',
                  fontSize: '1.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >GTL
              </Avatar>
            
            <LogoText>UAETaxLaws</LogoText>
          </NavLogo>


          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop navigation */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 0.5,
              // minHeight: '40px', // Ensure box has height
              // background: 'rgba(255,0,0,0.1)', // For debugging
            }}
          >
            {menuItems.length > 0 ? (
              menuItems.map((item) => (
                <React.Fragment key={item.text}>
                  {item.subItems ? (<NavMenuHoverable
                      title={item.text}
                      items={item.subItems}
                      icon={item.icon}
                    />
                  ) : (
                    <MenuButton
                      component={Link}
                      to={item.link}
                      startIcon={item.icon}
                    >
                      {item.text}
                    </MenuButton>
                  )}
                </React.Fragment>
              ))
            ) : (
              <Typography color='error'>
                No menu items available for navbar
              </Typography>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile drawer */}
      <StyledDrawer
        anchor='left'
        open={drawerOpen}
        onClose={handleDrawerClose}
        variant='temporary'
        sx={{
          display: { xs: 'block', md: 'none' },
        }}
      >
        <DrawerHeader>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mr: 1, fontSize: '1.25rem' }}>GTL</Box>
            <Typography variant='subtitle1' fontWeight={600}>
              UAETaxLaws
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerClose} sx={{ color: 'white' }}>
           
            <CloseIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Box sx={{ mt: 1, mb: 2 }}>
          {menuItems.map((item) => (
            <DrawerMenuItem
              key={item.text}
              item={item}
              handleDrawerClose={handleDrawerClose}
              navigate={navigate}
            />
          ))}
        </Box>
      </StyledDrawer>
    </StyledAppBar>
  )
}

export default NavBar

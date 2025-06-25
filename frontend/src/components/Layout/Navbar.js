// frontend/src/components/Layout/Navbar.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Correct path to AuthContext
import {
  AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem,
  Switch, FormControlLabel, Box, InputBase, Tooltip, Avatar
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// Styled search bar using Material-UI's styling utilities
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const Navbar = ({ setCurrentPage }) => {
  const { currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null); // For login/avatar menu
  const [toolsAnchorEl, setToolsAnchorEl] = useState(null); // For Tools dropdown
  const [convertorsAnchorEl, setConvertorsAnchorEl] = useState(null); // For Convertors dropdown
  const [navbarConfig, setNavbarConfig] = useState({ menuItems: [] });
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isMenuOpen = Boolean(anchorEl);
  const isToolsOpen = Boolean(toolsAnchorEl);
  const isConvertorsOpen = Boolean(convertorsAnchorEl);

  // Fetch menu items from Django backend
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        // Use the correct API endpoint for menu items
        const response = await fetch('http://localhost:8000/api/menu-items/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setNavbarConfig(data.navbar);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
        // Fallback to static config if fetch fails or backend is not running
        setNavbarConfig({
          brandName: "DailyToolbox",
          menuItems: [
            { name: "Home", link: "/" },
            {
              name: "Tools",
              is_dropdown: true, // Use is_dropdown as per backend model
              items: [
                { name: "Tool 1 (Fallback)", link: "/tools/category1" },
                { name: "Tool 2 (Fallback)", link: "/tools/category2" }
              ]
            },
            {
              name: "Convertors",
              is_dropdown: true, // Use is_dropdown as per backend model
              items: [
                { name: "Convertor 1 (Fallback)", link: "/convertors/category1" },
                { name: "Convertor 2 (Fallback)", link: "/convertors/category2" }
              ]
            }
          ],
          searchBar: true,
          loginAvatar: true,
          darkModeToggle: true
        });
      }
    };

    fetchMenuItems();
  }, []); // Empty dependency array means this runs once on mount

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    try {
      await logout();
      setCurrentPage('login'); // Redirect to login after logout
    } catch (error) {
      console.error("Logout failed:", error);
      // Display a custom message box instead of alert()
      const messageBox = document.createElement('div');
      messageBox.textContent = `Failed to log out: ${error.message}`;
      messageBox.style.cssText = 'position: fixed; top: 20px; right: 20px; background-color: #f44336; color: white; padding: 10px; border-radius: 5px; z-index: 1000;';
      document.body.appendChild(messageBox);
      setTimeout(() => document.body.removeChild(messageBox), 3000);
    }
  };

  const handleToolsMenuOpen = (event) => {
    setToolsAnchorEl(event.currentTarget);
  };

  const handleToolsMenuClose = () => {
    setToolsAnchorEl(null);
  };

  const handleConvertorsMenuOpen = (event) => {
    setConvertorsAnchorEl(event.currentTarget);
  };

  const handleConvertorsMenuClose = () => {
    setConvertorsAnchorEl(null);
  };

  const handlePageChange = (page) => {
    // Determine the actual page based on the link
    let targetPage = 'home'; // Default to home
    let targetCategory = 'home';

    if (page.startsWith('/tools/')) {
        targetPage = 'cards';
        targetCategory = 'tools'; // Or extract actual category from page string
    } else if (page.startsWith('/convertors/')) {
        targetPage = 'cards';
        targetCategory = 'convertors'; // Or extract actual category from page string
    } else if (page === '/' || page === 'home') {
        targetPage = 'home';
        targetCategory = 'home';
    } else if (page === 'login') {
        targetPage = 'login';
    } else if (page === 'signup') {
        targetPage = 'signup';
    } else if (page === 'dashboard') {
        targetPage = 'dashboard';
    }

    setCurrentPage(targetPage, targetCategory); // Update the parent App's state
    handleMenuClose(); // Close avatar menu if open
    handleToolsMenuClose(); // Close tools menu if open
    handleConvertorsMenuClose(); // Close convertors menu if open
  };

  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // Apply dark mode logic to the body or a theme provider
    document.body.classList.toggle('dark-mode', !isDarkMode);
    // You would typically use Material-UI's ThemeProvider for proper theming
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      {currentUser ? (
        <MenuItem onClick={() => handlePageChange('dashboard')}>Dashboard</MenuItem>
      ) : (
        <MenuItem onClick={() => handlePageChange('login')}>Login</MenuItem>
      )}
      {!currentUser && <MenuItem onClick={() => handlePageChange('signup')}>Sign Up</MenuItem>}
      {currentUser && <MenuItem onClick={handleLogout}>Logout</MenuItem>}
    </Menu>
  );

  return (
    <AppBar position="static" color={isDarkMode ? "default" : "primary"} enableColorOnDark>
      <Toolbar>
        {/* Brand Name */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ display: { xs: 'none', sm: 'block' }, cursor: 'pointer' }}
          onClick={() => handlePageChange('home')}
        >
          {navbarConfig.brandName || "DailyToolbox"}
        </Typography>

        {/* Menu Items */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
          {navbarConfig.menuItems.map((item, index) => (
            item.is_dropdown ? ( // Check for is_dropdown flag from backend
              item.name === "Tools" ? ( // Specific handling for 'Tools' dropdown
                <div key={item.name}>
                  <Button
                    sx={{ my: 2, color: 'white', display: 'block' }}
                    onClick={handleToolsMenuOpen}
                  >
                    {item.name}
                  </Button>
                  <Menu
                    anchorEl={toolsAnchorEl}
                    open={isToolsOpen}
                    onClose={handleToolsMenuClose}
                    MenuListProps={{ 'aria-labelledby': 'tools-button' }}
                  >
                    {item.items && item.items.map((subItem) => (
                      <MenuItem key={subItem.name} onClick={() => { handlePageChange(subItem.url); handleToolsMenuClose(); }}>
                        {/* You can add icons here if subItem.icon is available and you fetch Material Icons or other icon libraries */}
                        {subItem.name}
                      </MenuItem>
                    ))}
                  </Menu>
                </div>
              ) : item.name === "Convertors" ? ( // Specific handling for 'Convertors' dropdown
                <div key={item.name}>
                  <Button
                    sx={{ my: 2, color: 'white', display: 'block' }}
                    onClick={handleConvertorsMenuOpen}
                  >
                    {item.name}
                  </Button>
                  <Menu
                    anchorEl={convertorsAnchorEl}
                    open={isConvertorsOpen}
                    onClose={handleConvertorsMenuClose}
                    MenuListProps={{ 'aria-labelledby': 'convertors-button' }}
                  >
                    {item.items && item.items.map((subItem) => (
                      <MenuItem key={subItem.name} onClick={() => { handlePageChange(subItem.url); handleConvertorsMenuClose(); }}>
                        {/* You can add icons here if subItem.icon is available */}
                        {subItem.name}
                      </MenuItem>
                    ))}
                  </Menu>
                </div>
              ) : null // Handle other dropdowns or ignore
            ) : (
              <Button
                key={item.name}
                sx={{ my: 2, color: 'white', display: 'block' }}
                onClick={() => handlePageChange(item.url)} // Use item.url for navigation
              >
                {item.name}
              </Button>
            )
          ))}
        </Box>

        {/* Search Bar */}
        {navbarConfig.searchBar && (
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
        )}

        {/* Dark Mode Toggle */}
        {navbarConfig.darkModeToggle && (
          <FormControlLabel
            control={
              <Switch
                checked={isDarkMode}
                onChange={handleDarkModeToggle}
                icon={<Brightness7Icon />}
                checkedIcon={<Brightness4Icon />}
                color="default"
              />
            }
            label=""
            sx={{ ml: 1, mr: 0 }}
          />
        )}

        {/* Login Avatar/Icon */}
        {navbarConfig.loginAvatar && (
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Tooltip title={currentUser ? currentUser.email : "Guest"}>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                {currentUser && currentUser.email ? (
                  <Avatar sx={{bgcolor: 'secondary.main'}}>{currentUser.email.charAt(0).toUpperCase()}</Avatar>
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Mobile Menu Icon (Hamburger) - Not fully implemented for mobile in this example */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            aria-label="show more"
            aria-haspopup="true"
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>
      {renderMenu}
    </AppBar>
  );
};

export default Navbar;
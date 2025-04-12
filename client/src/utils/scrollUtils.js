/**
 * Scrolls to a specific element on the page by ID with smooth animation
 * @param {string} elementId - The ID of the element to scroll to (without the # symbol)
 */
export const scrollToElement = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};

/**
 * Handles navigation to hash links, either scrolling on the current page
 * or navigating to the home page with the hash if on a different page
 * @param {string} hash - The hash to navigate to (including the # symbol)
 * @param {function} navigate - React Router's navigate function
 * @param {string} currentPath - The current path from useLocation().pathname
 */
export const handleHashLinkClick = (hash, navigate, currentPath) => {
  // Extract the element ID from the hash (remove the # symbol)
  const elementId = hash.substring(1);
  
  if (currentPath === '/' || currentPath === '') {
    // If we're already on the home page, just scroll to the element
    scrollToElement(elementId);
  } else {
    // If we're on a different page, navigate to home page with the hash
    navigate(`/${hash}`);
  }
};

import React from 'react';

// This component renders the school app in an iframe
// The school app runs on port 3001 and is served via iframe
const SchoolFrame = () => {
  const schoolUrl = window.location.origin.includes('localhost') 
    ? 'http://localhost:3001' 
    : window.location.origin.replace(':3000', ':3001');
  
  // Get the current path to pass to the school app
  const currentPath = window.location.pathname;
  
  return (
    <iframe
      src={`${schoolUrl}${currentPath}`}
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      title="GITB School"
    />
  );
};

export default SchoolFrame;

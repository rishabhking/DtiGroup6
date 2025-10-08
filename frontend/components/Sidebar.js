import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const navStyle = {
    padding: '10px 20px',
    textDecoration: 'none',
    color: '#333',
    display: 'block',
    marginBottom: '10px',
    borderRadius: '4px'
  };

  return (
    <nav style={{ width: '250px', backgroundColor: '#fff', padding: '20px' }}>
      <NavLink 
        to="http://localhost:8080/problems"
        style={({ isActive }) => ({
          ...navStyle,
          backgroundColor: isActive ? '#e0e0e0' : 'transparent',
          fontWeight: isActive ? 'bold' : 'normal'
        })}
      >
        Problems
      </NavLink>
      {/* ...existing links... */}
    </nav>
  );
};

export default Sidebar;

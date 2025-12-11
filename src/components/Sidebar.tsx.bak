import React from 'react';
import { Link } from 'react-router-dom';
import './styles/sidebar.css'; // keep your css import if exists

export default function Sidebar() {
  return (
    <aside className='sidebar'>
      <div className='sidebar-inner'>
        <h1 className='brand'>ToolVerse AI</h1>

        <nav className='nav'>
          <Link to='/' className='nav-link'>Dashboard</Link>
          <Link to='/notes' className='nav-link'>Personal Notes</Link>

          <div style={{height:12}} />

          <Link to='/tools/pdf' className='nav-link'>PDF & Doc Tools</Link>
          <Link to='/tools/resume' className='nav-link'>Resume Maker AI</Link>
          <Link to='/tools/caption' className='nav-link'>Caption Generator</Link>
          <Link to='/tools/story' className='nav-link'>Kids Story Maker</Link>
          <Link to='/tools/homework' className='nav-link'>Homework Solver</Link>
          <Link to='/tools/budget' className='nav-link'>Budget Planner</Link>
          <Link to='/tools/image' className='nav-link'>Image Generator</Link>
        </nav>
      </div>
    </aside>
  );
}

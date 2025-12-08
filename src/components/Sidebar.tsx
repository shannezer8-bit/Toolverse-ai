import { Link } from "react-router-dom";
import "../styles/sidebar.css";

export default function Sidebar() {
  return (
    <div className='sidebar'>
      <h2>ToolVerse AI</h2>
      <Link to='/'>Dashboard</Link>
      <Link to='/notes'>Personal Notes</Link>
    </div>
  );
}

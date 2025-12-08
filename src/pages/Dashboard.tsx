import "../styles/dashboard.css";

export default function Dashboard() {
  return (
    <div className='dash'>
      <h1>ToolVerse AI Dashboard</h1>

      <div className='tile-container'>
        <div className='tile'>AI Tools</div>
        <div className='tile'>Notes</div>
        <div className='tile'>Coming Soon</div>
      </div>
    </div>
  );
}

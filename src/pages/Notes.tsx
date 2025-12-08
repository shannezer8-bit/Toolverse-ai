import { useState, useEffect } from "react";
import "../styles/notes.css";

export default function Notes() {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);

  // Load saved notes
  useEffect(() => {
    const saved = localStorage.getItem("notes");
    if (saved) setNotes(JSON.parse(saved));
  }, []);

  // Save notes automatically
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (!note.trim()) return;
    setNotes([...notes, note]);
    setNote("");
  };

  const deleteNote = (index) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  return (
    <div className="notes-container">
      <h1>Personal Notes</h1>

      <input
        placeholder="Write your note..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button onClick={addNote}>Add</button>

      <div className="notes-list">
        {notes.map((n, i) => (
          <div className="note-box" key={i}>
            <p>{n}</p>
            <button className="delete-btn" onClick={() => deleteNote(i)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

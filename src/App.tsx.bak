import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

/* Main pages (adjust paths if your files are in different folders) */
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";

/* Tool components (importing from project root components/tools) */
import PdfSummarizer from "../components/tools/PdfSummarizer";
import ResumeMaker from "../components/tools/ResumeMaker";
import CaptionGenerator from "../components/tools/CaptionGenerator";
import KidsStoryMaker from "../components/tools/KidsStoryMaker";
import HomeworkSolver from "../components/tools/HomeworkSolver";
import BudgetPlanner from "../components/tools/BudgetPlanner";
import ImageGenerator from "../components/tools/ImageGenerator";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Main screens */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/notes" element={<Notes />} />

        {/* Tools */}
        <Route path="/tools/pdf" element={<PdfSummarizer />} />
        <Route path="/tools/resume" element={<ResumeMaker />} />
        <Route path="/tools/caption" element={<CaptionGenerator />} />
        <Route path="/tools/story" element={<KidsStoryMaker />} />
        <Route path="/tools/homework" element={<HomeworkSolver />} />
        <Route path="/tools/budget" element={<BudgetPlanner />} />
        <Route path="/tools/image" element={<ImageGenerator />} />
      </Routes>
    </Router>
  );
}

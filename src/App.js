import { BrowserRouter, Routes, Route } from "react-router";
import Test from "./components/Test";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Test />} />
        
      </Routes>
    </BrowserRouter>
  );
}

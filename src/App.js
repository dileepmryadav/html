import { BrowserRouter, Routes, Route } from "react-router";
import Test from "./components/Test";
import Modal from "./components/Modal";
import GuideCard from "./components/GuideCard";
// import Decision from "./components/Decision";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* <Route path="/" element={<Test />} /> */}
        {/* <Route path="/mui" element={<Modal />} />
        <Route path="/2" element={<Decision />} /> */}

        <Route path="/" element={<GuideCard />} />

      </Routes>
    </BrowserRouter>
  );
}

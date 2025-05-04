import { BrowserRouter, Routes, Route } from "react-router";
import Test from "./components/Test";
import Modal from "./components/Modal";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Test />} /> */}
        <Route path="/" element={<Modal />} />
      </Routes>
    </BrowserRouter>
  );
}

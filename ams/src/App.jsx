import React from "react";
import ReqForm from "./components/ReqForm";
import Button from "./components/button";
import ResForm from "./components/ResForm";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <div>
      <Navbar />
      <ReqForm />
      <ResForm />
      <Button />
    </div>
  );
};

export default App;

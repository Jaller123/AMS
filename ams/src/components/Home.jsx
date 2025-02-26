import React from "react";
import { motion } from "framer-motion";
import MappingsPage from "./MappingPage/MappingPage";
import style from "./Home.module.css";
import laptop from "../assets/laptop.png";
import logoo from "../assets/am.png";
import { handleSendToWireMock } from "../backend/api";

const Home = ({ mappings, responses, handleDelete, handleUpdateRequest, handleUpdateResponse, setMappings }) => {
  return (
    <motion.div
      className={style.container}
    
    >
      {/* Welcome section with text and logo */}
      <motion.div className={style.welcomeContainer}>
        <motion.h1
          className={style.text}
          initial={{ x: "-60vw", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          Welcome to AMS
        </motion.h1>

        {/* Laptop container with logo inside, coming from the left */}
        <motion.div
          className={style.laptopContainer}
          initial={{ x: "-100vw" }}  
          animate={{ x: 0 }}         // Animate to the center of the screen
          transition={{ duration: 3, ease: "easeOut" }}  // Smooth transition
        >
          <img src={laptop} alt="AMS Laptop" className={style.laptopImage} />
          <div className={style.laptopScreen}>
            <img src={logoo} alt="AMS Logo" className={style.logoo} />
          </div>
        </motion.div>
      </motion.div>

      {/* "Saved Mappings" Section without animation */}
      <div className={style.mappingPageContainer}>
        <MappingsPage
          mappings={mappings}
          responses={responses}
          handleDelete={handleDelete}
          handleUpdateRequest={handleUpdateRequest}
          handleUpdateResponse={handleUpdateResponse}
          setMappings={setMappings}
          handleSendToWireMock={handleSendToWireMock}
        />
      </div>
    </motion.div>
  );
};

export default Home;

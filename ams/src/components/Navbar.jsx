import React from "react";
import { Link } from "react-router-dom"; // Använd Link istället för <a>
import styles from "./Navbar.module.css";
import logo from "../assets/AMSlogo.png";

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarBrand}>
        <img src={logo} alt="AMS" className={styles.logo} />
      </div>
      <ul className={styles.navbarMenu}>
        <li className={styles.menuItem}>
          <Link to="/" className={styles.link}>
            Home
          </Link>{" "}
          {/* Länk till startsidan */}
        </li>
        <li className={styles.menuItem}>
          <Link to="/mappings" className={styles.link}>
            Mappings
          </Link>{" "}
          {/* Länk till mappningar */}
        </li>
        <li className={styles.menuItem}>
          <Link to="/traffic" className={styles.link}>
            Traffic
          </Link>{" "}
          {/* New link */}
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;

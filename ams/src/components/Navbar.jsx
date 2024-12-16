import React from "react";
import { Link } from "react-router-dom"; // Använd Link istället för <a>
import styles from "./Navbar.module.css";

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarBrand}>AMS</div>
      <ul className={styles.navbarMenu}>
        <li className={styles.menuItem}>
          <Link to="/">Home</Link> {/* Länk till startsidan */}
        </li>
        <li className={styles.menuItem}>
          <Link to="/mappings">Mappings</Link> {/* Länk till mappningar */}
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;

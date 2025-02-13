import React from "react";
import { NavLink } from "react-router-dom";
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
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            Mappings
          </NavLink>
        </li>
        <li className={styles.menuItem}>
          <NavLink
            to="/traffic"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            Traffic
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;

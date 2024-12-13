import React from "react";
import styles from "./Navbar.module.css";

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarBrand}>AMS</div>
      <ul className={styles.navbarMenu}>
        <li className={styles.menuItem}>
          <a href="/mappings">Mappings</a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;

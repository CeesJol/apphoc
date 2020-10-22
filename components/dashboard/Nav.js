import React, { useContext } from "react";

import { UserContext } from "../../contexts/userContext";

const Nav = () => {
  const { nav, setNav } = useContext(UserContext);
  const navItems = ["Editor", "Layout", "Export", "Options"];
  return (
    <div className="dashboard__nav">
      <div className="dashboard__nav__content">
        {navItems.map((navItem, i) => (
          <div
            className={
              "dashboard__nav--item " +
              (nav === i && " dashboard__nav--item-selected")
            }
            onClick={() => setNav(i)}
            key={i}
          >
            {navItem}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Nav;

import { Link, useResolvedPath, useMatch } from "react-router-dom";
import classNames from "classnames";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import $ from "jquery";
function Sidebar() {
  const { user } = useSelector((state) => state.auth);
  const menu = useSelector((state) => state.menu.menu);
  const ListItem = ({ children, to, classMatch = {}, ...props }) => {
    let resolved = useResolvedPath(to);
    let match = useMatch({ path: resolved.pathname, end: true });
    return (
      <li className={classNames({ active: false, ...classMatch })}>
        {to != "#" && (
          <Link to={to} {...props}>
            {children}
          </Link>
        )}
        {to == "#" && children}
      </li>
    );
  };

  useEffect(() => {
    $(document)
      .off("click", "ul.sidebar-menu li a")
      .on("click", "ul.sidebar-menu li a", function (c) {
        var b = $(this),
          a = b.next();
        if (
          a.is(".treeview-menu") &&
          a.is(":visible") &&
          !$("body").hasClass("sidebar-collapse")
        )
          a.slideUp(500, function () {
            a.removeClass("menu-open");
          }),
            a.parent("li").removeClass("active");
        else if (a.is(".treeview-menu") && !a.is(":visible")) {
          var d = b.parents("ul").first();
          d.find("ul:visible").slideUp(500).removeClass("menu-open");
          var e = b.parent("li");
          a.slideDown(500, function () {
            a.addClass("menu-open"),
              d.find("li.active").removeClass("active"),
              e.addClass("active");
          });
        }
        c.preventDefault();
      });
  }, []);

  const renderMenu = menu.map((e, i) => {
    const classMatch = { treeview: typeof e.children !== "undefined" };
    return (
      <ListItem key={`menu_item_${i}`} to={e.path} classMatch={classMatch}>
        {typeof e.children === "undefined" && (
          <>
            <i className={e.icon}></i> {e.name}
          </>
        )}
        {typeof e.children !== "undefined" && (
          <>
            <a href="#">
              <i className={e.icon}></i> <span>{e.name}</span>
              <span className="pull-right-container">
                <i className="fa fa-angle-left pull-right"></i>
              </span>
            </a>
            <ul className="treeview-menu">
              {e.children.map((child, childIndex) => {
                return (
                  <ListItem
                    key={`menu_item_child_${childIndex}`}
                    to={child.path}
                  >
                    <i className="fa fa-circle-o"></i> {child.name}
                  </ListItem>
                );
              })}
            </ul>
          </>
        )}
      </ListItem>
    );
  });
  return (
    <aside className="main-sidebar">
      <section className="sidebar hide-scrollbar style-3">
        <div className="user-panel">
          <div className="pull-left info">
            <div className="row pull-right">
              <div className="col-xs-4">
                <img
                  src={user.image_url}
                  height="50px"
                  width="50px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="col-xs-8" style={{ marginTop: ".5em" }}>
                <a href="panel/account">
                  <p>{user.first_name}</p>
                  <i className="fa fa-circle text-success"></i> Online
                </a>
              </div>
            </div>
          </div>
        </div>
        <ul className="sidebar-menu">{renderMenu}</ul>
      </section>
    </aside>
  );
}

export default React.memo(Sidebar);

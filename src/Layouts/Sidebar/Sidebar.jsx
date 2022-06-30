import { Link, useResolvedPath, useMatch } from "react-router-dom";
import classNames from "classnames";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import $ from "jquery";
export default function Sidebar() {
  const menu = useSelector((state) => state.menu.menu);
  const ListItem = React.memo(({ children, to, classMatch = {}, ...props }) => {
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
  });

  useEffect(() => {
    (function () {
      var o = 500;
      $(document)
        .off("click", "ul.sidebar-menu li a")
        .on("click", "ul.sidebar-menu li a", function (e) {
          var n = $(this),
            t = n.next();
          if (
            t.is(".treeview-menu") &&
            t.is(":visible") &&
            !$("body").hasClass("sidebar-collapse")
          )
            t.slideUp(o, function () {
              t.removeClass("menu-open");
            }),
              t.parent("li").removeClass("active");
          else if (t.is(".treeview-menu") && !t.is(":visible")) {
            var s = n.parents("ul").first(),
              a = s.find("ul:visible").slideUp(o);
            a.removeClass("menu-open");
            var r = n.parent("li");
            t.slideDown(o, function () {
              t.addClass("menu-open"),
                s.find("li.active").removeClass("active"),
                r.addClass("active");
            });
          }
          e.preventDefault();
        });
    })();
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
        <div className="user-panel" style={{ height: "65px" }}>
          <div className="pull-left info" style={{ left: "5px" }}>
            <div className="row pull-right">
              <div className="col-xs-4">
                <img
                  src="https://files.diemnhangroup.com/dev/avatars/2022/05/4a3e9f_1653705692.jpg"
                  height="50px"
                  width="50px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="col-xs-8" style={{ marginTop: ".5em" }}>
                <a href="panel/account">
                  <p>Quốc Lộc</p>
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

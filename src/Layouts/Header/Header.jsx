import React, { useEffect } from "react";
import Select2 from "../../Components/Select2/Select2";
import { Dropdown } from "react-bootstrap";
import { setStoreId, toggleMenu } from "../../Redux/Actions/dngAction";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { logout } from "../../Redux/Actions/authAction";
export default function Header() {
  const { user } = useSelector((state) => state.auth);
  const { stores } = useSelector((state) => state.menu);
  const { storeId, openMenu } = useSelector((state) => state.dng);
  const dispatch = useDispatch();
  const handleOpenMenu = () => {
    const action = toggleMenu(!openMenu);
    dispatch(action);
  };

  const logoutUser = () => {
    dispatch(logout(user));
  };

  const handleSetStoreId = (e) => {
    dispatch(setStoreId(e.target.value));
  };

  return (
    <header className="main-header">
      <Link to="/" className="logo" style={{ background: "white" }}>
        <img src="/images/dng-logo.svg" width="165px" />
      </Link>
      <nav className="navbar navbar-static-top" role="navigation">
        <a
          href="#"
          className="sidebar-toggle"
          data-toggle="offcanvas"
          role="button"
          onClick={handleOpenMenu}
        >
          <span className="sr-only">Toggle navigation</span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
        </a>
        {stores.length == 1 && (
          <span className="store-name">
            {stores[0].company_name} {" - "} {stores[0].store_name}
          </span>
        )}
        {stores.length > 1 && (
          <Select2
            options={{
              width: "160px",
              data: stores.map((e) => {
                return {
                  id: e.id,
                  text: e.id + `: ` + e.store_name,
                  selected: e.id == storeId,
                };
              }),
            }}
            defaultValue={storeId}
            onChange={(e) => {
              handleSetStoreId(e);
            }}
          ></Select2>
        )}

        <div className="navbar-custom-menu">
          <ul className="nav navbar-nav">
            <li className="dropdown notifications-menu" id="notifications-menu">
              <a
                className="dropdown-toggle"
                data-toggle="dropdown"
                aria-expanded="true"
              >
                <i className="fa fa-calendar"></i>
              </a>
              <ul className="dropdown-menu">
                <li className="header notifications-count">
                  Bạn có 0 lịch hẹn
                </li>
                <li>
                  <ul className="menu"></ul>
                </li>
                <li className="footer">
                  <a>Khách chưa đến</a>
                </li>
              </ul>
            </li>
            <Dropdown
              id="dropdown-language"
              componentClass="li"
              style={{ paddingTop: "13px", paddingBottom: "13px" }}
            >
              <Dropdown.Toggle
                className="lang-toggle"
                type="button"
                id="dropdownMenu1"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="true"
              >
                <img
                  src="/images/vietnam.svg"
                  style={{ width: "20px", height: "auto" }}
                  className="icon-status"
                />
              </Dropdown.Toggle>
              <Dropdown.Menu aria-labelledby="dropdownMenu1">
                <li>
                  <a href="#" style={{ color: "#777" }}>
                    Việt Nam
                  </a>
                </li>
                <li>
                  <a href="#" style={{ color: "#777" }}>
                    English
                  </a>
                </li>
              </Dropdown.Menu>
            </Dropdown>
            <li
              className="dropdown notifications-menu"
              style={{ position: "relative" }}
            >
              <a href="#" className="snt">
                <i
                  className="fa fa-globe"
                  style={{ fontSize: "18px" }}
                  aria-hidden="true"
                ></i>
                <span className="total-noti"></span>
              </a>
              <div id="notificationContainer">
                <div id="notificationTitle" className=" d-flex j-sb">
                  <span>Thông báo</span>
                  <span
                    style={{
                      color: "#1876f2",
                      fontWeight: "normal",
                      cursor: "pointer",
                    }}
                    className="read-all"
                  >
                    Đánh dấu là đã đọc
                  </span>
                </div>
                <div
                  id="notificationsBody"
                  className="notifications style-nav outPage "
                ></div>
                <div id="notificationFooter">
                  <a href="user_notifications">Xem thêm</a>
                </div>
              </div>
            </li>
            <Dropdown
              componentClass="li"
              className="user user-menu"
              id="dropdown-header-2"
            >
              <Dropdown.Toggle componentClass="a" className="navbar-link">
                <img src="/images/dotmenu.svg" style={{ width: "19px" }} />
              </Dropdown.Toggle>
              <Dropdown.Menu
                className="dropdown-menu icon-group"
                style={{ width: "350px" }}
              >
                <li className="user-header">
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      margin: "0 -10px",
                    }}
                  >
                    <a
                      className="nv-icon"
                      href="http://localhost/crm-dng/panel/account"
                    >
                      <div className="fl">
                        <img
                          src={user.image_url}
                          style={{ borderRadius: "50%" }}
                          alt="Hinh dai dien"
                        />
                      </div>
                      <div className="">Tài khoản</div>
                    </a>
                    <a
                      className="nv-icon"
                      href="https://edu.diemnhan.com"
                      target="_blank"
                    >
                      <div className="fl">
                        <img src="/images/educate.svg" alt="icon" />
                      </div>
                      <div className="">Đào tạo</div>
                    </a>
                    <a
                      className="nv-icon"
                      href="http://localhost/crm-dng/appointments"
                    >
                      <div className="fl">
                        <img src="/images/appointment-nav.svg" alt="icon" />
                      </div>
                      <div className="">Lịch hẹn</div>
                    </a>

                    <a
                      className="nv-icon"
                      href="http://localhost/crm-dng/nhansu"
                    >
                      <div className="fl">
                        <img src="/images/human-resources.svg" alt="icon" />
                      </div>
                      <div className="">Nhân sự</div>
                    </a>

                    <a
                      className="nv-icon"
                      href="http://localhost/crm-dng/ketoan/cashbooks"
                    >
                      <div className="fl">
                        <img src="/images/database.svg" alt="icon" />
                      </div>
                      <div className="">Sổ quỹ</div>
                    </a>
                    <a
                      className="nv-icon"
                      href="http://localhost/crm-dng/hocvien"
                    >
                      <div className="fl">
                        <img src="/images/school.svg" alt="icon" />
                      </div>
                      <div className="">Học viện</div>
                    </a>
                    <a className="nv-icon hide" id="open_notification" href="#">
                      <div className="fl">
                        <img src="/images/bell_icon.png" alt="icon" />
                      </div>
                      <div className="">Nhận thông báo</div>
                    </a>
                  </div>
                </li>
                <li className="user-footer">
                  <a href="#" className="c-btn" onClick={logoutUser}>
                    Đăng xuất
                  </a>
                </li>
              </Dropdown.Menu>
            </Dropdown>
          </ul>
        </div>
      </nav>
    </header>
  );
}

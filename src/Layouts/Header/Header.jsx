import React from "react";
import Logo from "../../Assets/Images/dng-logo.svg";
import Dotmenu from "../../Assets/Images/dotmenu.svg";
import Select2 from "../../Components/Select2/Select2";
import { Dropdown } from "react-bootstrap";
import { toggleMenu } from "../../Redux/Actions/dngAction";
import { useSelector, useDispatch } from "react-redux";
export default function Header() {
  const openMenu = useSelector((state) => state.dng.openMenu);
  const dispatch = useDispatch();
  const handleOpenMenu = () => {
    const action = toggleMenu(!openMenu);
    dispatch(action);
  };

  return (
    <header className="main-header">
      <a
        href="http://localhost/crm-dng/"
        className="logo"
        style={{ background: "white" }}
      >
        <img src={Logo} width="165px" />
      </a>
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
        <Select2>
          <>
            <option value="1">1: Tân Bình</option>
            <option value="2">2: Quận 10</option>
            <option value="3">3: Thủ Đức</option>
            <option value="4">4: Phan Thiết</option>
            <option value="6">6: Bình Dương</option>
            <option value="7">7: Biên Hòa</option>
            <option value="8">8: DNG - Học viên</option>
            <option value="9">9: Vũng Tàu</option>
            <option value="10">10: Long An</option>
            <option value="11">11: Tiền Giang</option>
            <option value="12">12: Cần Thơ</option>
            <option value="13">13: Đà Nẵng</option>
            <option value="14">14: Buôn Ma Thuột</option>
            <option value="15">15: Phan Rang</option>
            <option value="16">16: Gia Lai</option>
            <option value="17">17: Gò Vấp</option>
            <option value="19">19: Đà Nẵng II</option>
            <option value="20">20: Tây Ninh</option>
            <option value="22">22: Quảng Nam</option>
            <option value="23">23: Nha Trang</option>
            <option value="24">24: Đà Lạt - Lâm Đồng</option>
            <option value="25">25: Long Xuyên - An Giang</option>
            <option value="26">26: Tuy Hoà - Phú Yên</option>
            <option value="27">27: Quy Nhơn - Bình Định</option>
            <option value="30">30: Bảo Lộc - Lâm Đồng</option>
            <option value="32">32: Campuchia - Phnom Penh</option>
            <option value="33">33: Huế</option>
            <option value="34">34: Bến Tre</option>
            <option value="35">35: Bình Phước</option>
            <option value="36">36: Quảng Ngãi</option>
            <option value="37">37: SeoulCenter Quận 10</option>
            <option value="39">39: Vĩnh Long</option>
            <option value="40">40: Bình Thạnh</option>
            <option value="41">41: SeoulCenter Quận 1</option>
            <option value="42">42: Cà Mau</option>
            <option value="45">45: Quận 7</option>
            <option value="46">46: Academy Cần Thơ</option>
            <option value="47">47: Trung Tâm Online</option>
            <option value="48">48: Q.Đống Đa</option>
            <option value="49">49: Academy Hà Nội</option>
            <option value="50">50: S-Life</option>
            <option value="51">51: Dĩ An</option>
            <option value="52">52: Đắk Nông</option>
            <option value="53">53: Hải Phòng</option>
          </>
        </Select2>

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
            id="dropdown-header-1"
              componentClass="li"
              style={{ paddingTop: "13px", paddingBottom: "13px" }}
            >
              <Dropdown.Toggle
                className="lang-toggle"
                style={{
                  width: "auto",
                  height: "auto",
                  border: "1px solid white",
                  borderRadius: "5px",
                  background: "none",
                  textAlign: "center",
                }}
                type="button"
                id="dropdownMenu1"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="true"
              >
                <img
                  src="http://localhost/crm-dng/assets/images/vietnam.svg"
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
                <img src={Dotmenu} style={{ width: "19px" }} />
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
                          src="https://files.diemnhangroup.com/dev/avatars/2022/05/4a3e9f_1653705692.jpg"
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
                        <img
                          src="http://localhost/crm-dng/assets/images/educate.svg"
                          alt="icon"
                        />
                      </div>
                      <div className="">Đào tạo</div>
                    </a>
                    <a
                      className="nv-icon"
                      href="http://localhost/crm-dng/appointments"
                    >
                      <div className="fl">
                        <img
                          src="http://localhost/crm-dng/assets/images/appointment-nav.svg"
                          alt="icon"
                        />
                      </div>
                      <div className="">Lịch hẹn</div>
                    </a>

                    <a
                      className="nv-icon"
                      href="http://localhost/crm-dng/nhansu"
                    >
                      <div className="fl">
                        <img
                          src="http://localhost/crm-dng/assets/images/human-resources.svg"
                          alt="icon"
                        />
                      </div>
                      <div className="">Nhân sự</div>
                    </a>

                    <a
                      className="nv-icon"
                      href="http://localhost/crm-dng/ketoan/cashbooks"
                    >
                      <div className="fl">
                        <img
                          src="http://localhost/crm-dng/assets/images/database.svg"
                          alt="icon"
                        />
                      </div>
                      <div className="">Sổ quỹ</div>
                    </a>
                    <a
                      className="nv-icon"
                      href="http://localhost/crm-dng/hocvien"
                    >
                      <div className="fl">
                        <img
                          src="http://localhost/crm-dng/assets/images/school.svg"
                          alt="icon"
                        />
                      </div>
                      <div className="">Học viện</div>
                    </a>
                    <a className="nv-icon hide" id="open_notification" href="#">
                      <div className="fl">
                        <img
                          src="http://localhost/crm-dng/assets/images/bell_icon.png"
                          alt="icon"
                        />
                      </div>
                      <div className="">Nhận thông báo</div>
                    </a>
                  </div>
                </li>
                <li className="user-footer">
                  <a
                    href="http://localhost/crm-dng/panel/logout"
                    className="c-btn"
                  >
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

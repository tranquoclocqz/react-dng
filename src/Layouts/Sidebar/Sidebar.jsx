import { PureComponent } from "react";
import { Link } from "react-router-dom";
export default class Sidebar extends PureComponent {
  render() {
    return (
      <aside className="main-sidebar">
        <section className="sidebar style-3">
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
          <ul className="sidebar-menu">
            <li>
              <Link to="/">
                <i className="fa fa-home"></i>Home
              </Link>
            </li>
            <li>
              <Link to="/marketing_offlines/reports_v2">
                <i className="fa fa-home"></i>marketing_offlines/reports_v2
              </Link>
            </li>
          </ul>
        </section>
      </aside>
    );
  }
}

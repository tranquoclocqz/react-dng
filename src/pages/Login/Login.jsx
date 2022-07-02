import "../../Assets/Styles/Login.css";
import "../../Assets/Styles/adminlte.min.css";
import { Link } from "react-router-dom";
function Login() {
  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <img src="/images/logo-text.png" />
        </div>
        <div className="login-box-body">
          <p className="login-box-msg">Đăng nhập hệ thống</p>
          <form
            action="http://localhost/crm-dng/login"
            method="post"
            acceptCharset="utf-8"
            className="ng-pristine ng-valid"
          >
            <div className="form-group">
              <label htmlFor="username">Tài khoản</label>
              <input
                type="text"
                name="username"
                id="username"
                className="form-control"
              />
            </div>{" "}
            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                name="password"
                id="password"
                className="form-control"
              />
            </div>
            <input
              type="hidden"
              name="redirect"
              value="aHR0cDovL2xvY2FsaG9zdC9jcm0tZG5nL3NhbGFyeV9mZWVkYmFjay9lZGl0LzM1"
              autoComplete="off"
            />
            <div className="row">
              <div className="col-xs-6">
                <div className="checkbox">
                  <div
                    className="icheckbox_flat-blue"
                    aria-checked="false"
                    aria-disabled="false"
                  >
                    <input
                      type="checkbox"
                      name="remember"
                      value="1"
                      className="icheck-blue"
                    />
                    <ins className="iCheck-helper"></ins>
                  </div>{" "}
                  Ghi nhớ
                </div>
              </div>
              <div className="col-xs-6" id="warp_btn_login">
                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-flat"
                >
                  Đăng nhập
                </button>
              </div>
            </div>
          </form>
          <div className="text-center">
            <hr />
            <b className="text-center text-highlight-login">
              MỖI CÁ NHÂN SẼ PHẢI TỰ BẢO VỆ TÀI KHOẢN CỦA MÌNH!
              <br />
              NẾU XẢY RA GIAN LẬN XUẤT PHÁT TỪ TÀI KHOẢN NÀO THÌ CHỦ SỞ HỮU SẼ
              CHỊU TRÁCH NHIỆM 100%.
            </b>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;

import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Auth from "../../Api/Auth";
import "../../Assets/Styles/Login.css";
import { loginSuccess } from "../../Redux/Actions/authAction";
import { setCompnayId, setStoreId } from "../../Redux/Actions/dngAction";
import React, { useEffect, useState } from "react";
function Login() {
  const { register, handleSubmit, setFocus } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isAuth } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const onSubmit = (data) => {
    setLoading(true);
    Auth.login(data).then((response) => {
      if (response.status == 1) {
        let user = response.data.user;
        user.main_group_id = response.data.main_group_id;
        user.permissions = response.data.permissions;
        user.refresh_token = response.data.refresh_token;
        user.token = response.data.token;
        dispatch(loginSuccess(user));
        dispatch(setCompnayId(1));
        dispatch(setStoreId(user.main_store_id));
        navigate("/", { replace: true });
      } else {
        setError(response.message);
        setFocus("password", { shouldSelect: true });
      }
      setLoading(false);
    });
  };
  useEffect(() => {
    if (isAuth) navigate("/", { replace: true });
  }, []);

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <img src="/images/logo-text.png" />
        </div>
        <div className="login-box-body">
          <p className="login-box-msg">Đăng nhập hệ thống</p>
          <form
            method="post"
            acceptCharset="utf-8"
            onSubmit={handleSubmit(onSubmit)}
          >
            {error && (
              <div className="alert alert-danger" role="alert">
                <p></p>
                <p>{error}</p>
                <p></p>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="username">Tài khoản</label>
              <input
                type="text"
                name="username"
                id="username"
                className="form-control"
                {...register("username")}
              />
            </div>{" "}
            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                name="password"
                id="password"
                className="form-control"
                {...register("password")}
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
                      {...register("remember")}
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
                  disabled={loading}
                >
                  {!loading ? "Đăng nhập" : "Đang đăng nhập"}
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

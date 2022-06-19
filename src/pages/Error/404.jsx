import { Link } from "react-router-dom";
export default function Error404() {
  return (
    <>
      <div className="error-page">
        <h2 className="headline text-yellow"> 404</h2>
        <div className="error-content">
          <h3>
            <i className="fa fa-warning text-yellow"></i> Oops! Page not found.
          </h3>
          <p>
            We could not find the page you were looking for.
            <br />
            Meanwhile, you may. <Link to="/">return to dashboard</Link>
          </p>
        </div>
      </div>
    </>
  );
}

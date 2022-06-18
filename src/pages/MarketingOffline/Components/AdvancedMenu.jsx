import { Link, useMatch, useResolvedPath } from "react-router-dom";
import "../../../Assets/Styles/advanced_styles.css";
export default function AdvancedMenu() {
  const AdvancedLink = ({ children, to, ...props }) => {
    let resolved = useResolvedPath(to);
    let match = useMatch({ path: resolved.pathname, end: true });
    return (
      <li className={match ? "active" : ""}>
        <Link to={to} {...props}>
          {children}
        </Link>
      </li>
    );
  };
  return (
    <ul className="advanced-menu">
      <AdvancedLink to="/marketing_offlines/phones">Data</AdvancedLink>
      <AdvancedLink to="/marketing_offlines/partners">PG</AdvancedLink>
      <AdvancedLink to="/marketing_offlines/campaigns">
        Chương trình
      </AdvancedLink>
      <AdvancedLink to="/marketing_offlines/locations">Địa điểm</AdvancedLink>
      <AdvancedLink to="/marketing_offlines/reports">Báo cáo PG</AdvancedLink>
      <AdvancedLink to="/marketing_offlines/reports_v2">
        Báo cáo tổng
      </AdvancedLink>
    </ul>
  );
}

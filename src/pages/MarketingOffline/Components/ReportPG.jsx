import React from "react";
import { formatNumber } from "../../../Hooks";
import classNames from "classnames";
function ReportPG({ rows }) {
  return (
    <div className="mgt-10 bg-content pd-10px">
      <table className="table table-striped middle-tb">
        <thead>
          <tr>
            <th scope="col" className="text-left" style={{ width: "20%" }}>
              #
            </th>
            <th scope="col" className="text-center" style={{ width: "20%" }}>
              SĐT ( <span className="text-success">Hợp lệ</span> -{" "}
              <span className="text-danger">Không hợp lệ</span> )
            </th>
            <th scope="col" className="text-center">
              Số ca làm việc
            </th>
            <th scope="col" className="text-center">
              Tiến trình
            </th>
          </tr>
        </thead>
        <tbody className={classNames({ loading: !rows })}>
          {rows &&
            rows.map((item) => {
              return (
                <tr key={`row_` + item.id}>
                  <th scope="row" className="text-left">
                    {item.name + " - " + item.phone}
                  </th>
                  <td className="text-center">
                    {item.total?.total_phone
                      ? formatNumber(item.total.total_phone)
                      : 0}
                    ({" "}
                    <span title="Hợp lệ" className="text-success">
                      {item.total?.sum_sus
                        ? formatNumber(item.total.sum_sus)
                        : 0}
                    </span>{" "}
                    -
                    <span title="Không hợp lệ" className="text-danger">
                      {item.total?.sum_err
                        ? formatNumber(item.total.sum_err)
                        : 0}
                    </span>
                    )
                  </td>
                  <td className="text-center">
                    {item.total_tg?.total_shift
                      ? formatNumber(item.total_tg.total_shift)
                      : 0}
                  </td>
                  <td className="text-center">
                    {item.total_tg?.total_process
                      ? formatNumber(item.total_tg.total_process)
                      : 0}{" "}
                    /{" "}
                    {item.total_tg?.total_target
                      ? formatNumber(item.total_tg.total_target)
                      : 0}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
export default ReportPG;

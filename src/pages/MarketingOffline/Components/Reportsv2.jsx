import React from "react";
import { formatNumber,getMoney } from "../../../Hooks";
function Reportsv2({
  appointment,
  data,
  invoice,
  invoice_turn,
  sales,
}) {
  return (
    <>
    <div className="mgt-10 overview po-r">
      <div className="note">
        <i
          ng-click="showNote = !showNote"
          className="fa fa-sticky-note-o"
          aria-hidden="true"
        ></i>
        <div className="box-note" ng-if="showNote" style={{display: 'none'}}>
          * TB: Trung bình <br />
          * KH: Khách hàng <br />
          * HĐ: Hóa đơn <br />
          * K: Nghìn đồng <br />
          * Tr: Triệu đồng <br />
          * Tỷ: Tỷ đồng <br />
        </div>
      </div>
      <div className="row-item d-flex rp-item">
        <div className="icon col-item">
          <div>
            <i className="fa fa-phone" aria-hidden="true"></i>
            <div className="text-descript w-100 text-center fs-14">Data</div>
          </div>
        </div>
        <div className="col-item col-item-1 text-center">
          <div className="text-descript w-100 ">Tổng data</div>
          <div className="numb w-100 text-danger">
            {formatNumber(data.total)}
          </div>
          <div className="d-flex">
            <div className="child-col-item rp-50">
              <div className="numb numb-2">
                <span className="text-success">{formatNumber(data.new)}</span>{" "}
                <small>({formatNumber(data.new_percent, 1)}%)</small>
              </div>
              <div className="text-descript w-100">Khách mới</div>
            </div>
            <div className="child-col-item rp-50">
              <div className="numb numb-2">
                <span className="text-success">{formatNumber(data.old)}</span>{" "}
                <small>({formatNumber(data.old_percent, 1)}%)</small>
              </div>
              <div className="text-descript w-100">Khách cũ</div>
            </div>
          </div>
        </div>
      </div>
      <div className="row-item d-flex rp-item">
        <div className="icon col-item">
          <div>
            <i className="fa fa-calendar-o" aria-hidden="true"></i>
            <div className="text-descript w-100 text-center fs-14">
              Lịch Hẹn
            </div>
          </div>
        </div>
        <div className="col-item col-item-1 text-center">
          <div className="d-flex">
            <div className="child-col-item">
              <div className="text-descript w-100">
                Tổng lượt khách đặt lịch
              </div>
              <div className="numb text-danger">
                {formatNumber(appointment.turn.total)}
              </div>
              <div className="d-flex d-flex-center">
                <div className="child-col-item rp-3">
                  <div className="numb numb-2">
                    <span className="text-success">
                      {formatNumber(appointment.turn.total_invoice)}
                    </span>{" "}
                    <small>
                      ({formatNumber(appointment.turn.total_invoice_percent, 1)}
                      %)
                    </small>
                  </div>
                  <div className="text-descript w-100">Phát sinh hóa đơn</div>
                </div>
                <div className="child-col-item rp-3">
                  <div className="numb numb-2">
                    <span className="text-success">
                      {formatNumber(appointment.turn.total_cancel)}
                    </span>{" "}
                    <small>
                      ({formatNumber(appointment.turn.total_cancel_percent, 1)}
                      %)
                    </small>
                  </div>
                  <div className="text-descript w-100">
                    Không đến ( hủy hẹn )
                  </div>
                </div>
                <div className="child-col-item rp-3">
                  <div className="numb numb-2">
                    <span className="text-success">
                      {formatNumber(appointment.turn.total_fall)}
                    </span>{" "}
                    <small>
                      ({formatNumber(appointment.turn.total_fall_percent, 1)}%)
                    </small>
                  </div>
                  <div className="text-descript w-100">Ra về</div>
                </div>
              </div>
            </div>
            <div className="child-col-item">
              <div className="text-descript w-100">Tổng khách đặt lịch</div>
              <div className="numb text-danger">
                {formatNumber(appointment.customer.total)}
              </div>
              <div className="d-flex d-flex-center">
                <div className="child-col-item rp-3">
                  <div className="numb numb-2">
                    <span className="text-success">
                      {formatNumber(appointment.customer.total_invoice)}
                    </span>{" "}
                    <small>
                      (
                      {formatNumber(
                        appointment.customer.total_invoice_percent,
                        1
                      )}
                      %)
                    </small>
                  </div>
                  <div className="text-descript w-100">Phát sinh hóa đơn</div>
                </div>
                <div className="child-col-item rp-3">
                  <div className="numb numb-2">
                    <span className="text-success">
                      {formatNumber(appointment.customer.total_cancel)}
                    </span>{" "}
                    <small>
                      (
                      {formatNumber(
                        appointment.customer.total_cancel_percent,
                        1
                      )}
                      %)
                    </small>
                  </div>
                  <div className="text-descript w-100">
                    Không đến ( hủy hẹn )
                  </div>
                </div>
                <div className="child-col-item rp-3">
                  <div className="numb numb-2">
                    <span className="text-success">
                      {formatNumber(appointment.customer.total_fall)}
                    </span>{" "}
                    <small>
                      (
                      {formatNumber(appointment.customer.total_fall_percent, 1)}
                      %)
                    </small>
                  </div>
                  <div className="text-descript w-100">Ra về</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row-item d-flex rp-item">
        <div className="icon col-item">
          <div>
            <i className="fa fa-handshake-o" aria-hidden="true"></i>
            <div className="text-descript w-100 text-center fs-14">Hóa đơn</div>
          </div>
        </div>
        <div className="col-item col-item-1 text-center">
          <div className="d-flex">
            <div className="child-col-item">
              <div className="text-descript w-100">
                Tổng hóa đơn theo lượt khách
              </div>
              <div className="numb text-danger">
                {formatNumber(invoice.turn.total)}
              </div>
              <div className="text-descript w-100">Hóa đơn 0 đồng</div>
              <div className="numb numb-2 text-danger">
                {formatNumber(invoice.turn.total_zero)}
              </div>
              <div className="numb numb-2 text-primary">
                {formatNumber(invoice.turn.total_cus_zero)} KH
              </div>
            </div>
            <div className="child-col-item">
              <div className="text-descript w-100 ">
                Tổng hóa đơn phát sinh theo khách
              </div>
              <div className="numb w-100 text-danger">
                {getMoney(invoice.customer.total)}
              </div>
              <div className="d-flex">
                <div className="child-col-item rp-25">
                  <div className="numb numb-2 text-primary">
                    {formatNumber(invoice.customer.total_zero)} KH
                  </div>
                  <div className="text-descript w-100">0 đồng</div>
                  <div className="numb numb-2">
                    {invoice.customer.total_invoice_cus_zero} HĐ
                  </div>
                </div>
                <div className="child-col-item rp-25">
                  <div className="numb numb-2 text-primary">
                    {formatNumber(invoice.customer.total_one)} KH
                  </div>
                  <div className="text-descript w-100">1 hóa đơn</div>
                  <div className="numb numb-2 text-success">
                    {getMoney(invoice.customer.total_one_sale)}
                  </div>
                </div>
                <div className="child-col-item rp-25">
                  <div className="numb numb-2 text-primary">
                    {formatNumber(invoice.customer.total_two)} KH
                  </div>
                  <div className="text-descript w-100">2 hóa đơn</div>
                  <div className="numb numb-2 text-success">
                    {getMoney(invoice.customer.total_two_sale)}
                  </div>
                </div>
                <div className="child-col-item rp-25">
                  <div className="numb numb-2 text-primary">
                    {formatNumber(invoice.customer.total_bigger_two)} KH
                  </div>
                  <div className="text-descript w-100"> &gt; 2 hóa đơn </div>
                  <div className="numb numb-2 text-success">
                    {getMoney(invoice.customer.total_bigger_two_sale)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row-item d-flex rp-item">
        <div className="icon col-item">
          <div>
            <i className="fa fa-handshake-o" aria-hidden="true"></i>
            <div className="text-descript w-100 text-center fs-14">
              Doanh số theo lần
            </div>
          </div>
        </div>
        <div className="col-item col-item-1 text-center">
          <div className="text-descript w-100">Doanh số theo lần khách đến</div>
          <div className="d-flex">
            <div className="child-col-item rp-25">
              <div
                className="text-descript box-relative"
                ng-blur="hideDetail(invoice_turn.turn_1)"
                tabIndex="-1"
              >
                Lần 1
                <i
                  ng-if="invoice_turn.turn_1.cus"
                  ng-click="openDetail(invoice_turn.turn_1)"
                  className="fa fa-question-circle-o pointer"
                  aria-hidden="true"
                  title="Chi tiết"
                ></i>
                <div
                  className="detail"
                  ng-show="invoice_turn.turn_1.show"
                  ng-bind-html="converHtml(invoice_turn.turn_1.myhtml)"
                ></div>
              </div>
              <div className="numb numb-2">{invoice_turn.turn_1.cus} HĐ</div>
              <div className="numb numb-2 text-success">
                {getMoney(invoice_turn.turn_1.total)}{" "}
                <small>
                  ( {formatNumber(invoice_turn.turn_1.average, 1)}% )
                </small>
              </div>
              <div className="avg-cus numb numb-2 text-danger pointer">
                <span title="Trung bình">TB: </span>
                {getMoney(invoice_turn.turn_1.avg_cus)}
              </div>
            </div>
            <div className="child-col-item rp-25">
              <div
                className="text-descript box-relative"
                ng-blur="hideDetail(invoice_turn.turn_2)"
                tabIndex="-1"
              >
                Lần 2
                <i
                  ng-if="invoice_turn.turn_2.cus"
                  ng-click="openDetail(invoice_turn.turn_2)"
                  className="fa fa-question-circle-o pointer"
                  aria-hidden="true"
                  title="Chi tiết"
                ></i>
                <div
                  className="detail"
                  ng-show="invoice_turn.turn_2.show"
                  ng-bind-html="converHtml(invoice_turn.turn_2.myhtml)"
                ></div>
              </div>
              <div className="numb numb-2">{invoice_turn.turn_2.cus} HĐ</div>
              <div className="numb numb-2 text-success">
                {getMoney(invoice_turn.turn_2.total)}
                <small>
                  ( {formatNumber(invoice_turn.turn_2.average, 1)}% )
                </small>
              </div>
              <div className="avg-cus numb numb-2 text-danger pointer">
                <span title="Trung bình">TB: </span>
                {getMoney(invoice_turn.turn_2.avg_cus)}
              </div>
            </div>
            <div className="child-col-item rp-25">
              <div
                className="text-descript box-relative"
                ng-blur="hideDetail(invoice_turn.turn_3)"
                tabIndex="-1"
              >
                Lần 3
                <i
                  ng-if="invoice_turn.turn_3.cus"
                  ng-click="openDetail(invoice_turn.turn_3)"
                  className="fa fa-question-circle-o pointer"
                  aria-hidden="true"
                  title="Chi tiết"
                ></i>
                <div
                  className="detail"
                  ng-show="invoice_turn.turn_3.show"
                  ng-bind-html="converHtml(invoice_turn.turn_3.myhtml)"
                ></div>
              </div>
              <div className="numb numb-2">{invoice_turn.turn_3.cus} HĐ</div>
              <div className="numb numb-2 text-success">
                {getMoney(invoice_turn.turn_3.total)}
                <small>
                  ( {formatNumber(invoice_turn.turn_3.average, 1)}% )
                </small>
              </div>
              <div className="avg-cus numb numb-2 text-danger pointer">
                <span title="Trung bình">TB: </span>
                {getMoney(invoice_turn.turn_3.avg_cus)}
              </div>
            </div>
            <div className="child-col-item rp-25">
              <div
                className="text-descript box-relative"
                ng-blur="hideDetail(invoice_turn.turn_4)"
                tabIndex="-1"
              >
                Lần 4
                <i
                  ng-if="invoice_turn.turn_4.cus"
                  ng-click="openDetail(invoice_turn.turn_4)"
                  className="fa fa-question-circle-o pointer"
                  aria-hidden="true"
                  title="Chi tiết"
                ></i>
                <div
                  className="detail"
                  ng-show="invoice_turn.turn_4.show"
                  ng-bind-html="converHtml(invoice_turn.turn_4.myhtml)"
                ></div>
              </div>
              <div className="numb numb-2">{invoice_turn.turn_4.cus} HĐ</div>
              <div className="numb numb-2 text-success">
                {getMoney(invoice_turn.turn_4.total)}
                <small>
                  ( {formatNumber(invoice_turn.turn_4.average, 1)}% )
                </small>
              </div>
              <div className="avg-cus numb numb-2 text-danger pointer">
                <span title="Trung bình">TB: </span>
                {getMoney(invoice_turn.turn_4.avg_cus)}
              </div>
            </div>
            <div className="child-col-item rp-25">
              <div
                className="text-descript box-relative"
                ng-blur="hideDetail(invoice_turn.turn_5)"
                tabIndex="-1"
              >
                Lần 5
                <i
                  ng-if="invoice_turn.turn_5.cus"
                  ng-click="openDetail(invoice_turn.turn_5)"
                  className="fa fa-question-circle-o pointer"
                  aria-hidden="true"
                  title="Chi tiết"
                ></i>
                <div
                  className="detail"
                  ng-show="invoice_turn.turn_5.show"
                  ng-bind-html="converHtml(invoice_turn.turn_5.myhtml)"
                ></div>
              </div>
              <div className="numb numb-2">{invoice_turn.turn_5.cus} HĐ</div>
              <div className="numb numb-2 text-success">
                {getMoney(invoice_turn.turn_5.total)}
                <small>
                  ( {formatNumber(invoice_turn.turn_5.average, 1)}% )
                </small>
              </div>
              <div className="avg-cus numb numb-2 text-danger pointer">
                <span title="Trung bình">TB: </span>
                {getMoney(invoice_turn.turn_5.avg_cus)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row-item">
        <div className="d-flex rp-item">
          <div className="icon col-item">
            <div>
              <i className="fa fa-usd" aria-hidden="true"></i>
              <div className="text-descript w-100 text-center fs-14">
                Doanh Số
              </div>
            </div>
          </div>
          <div className="col-item col-item-1 text-center">
            <div className="col-item col-item-1">
              <div
                className="text-descript box-relative"
                ng-blur="hideDetail(all)"
                tabIndex="-1"
              >
                Tổng doanh số
                <i
                  ng-if="sales.total"
                  ng-click="openDetail(all)"
                  className="fa fa-question-circle-o pointer"
                  aria-hidden="true"
                  title="Chi tiết"
                ></i>
                <div
                  className="detail"
                  ng-show="all.show"
                  ng-bind-html="converHtml(all.myhtml)"
                ></div>
              </div>
              <div className="numb w-100 text-danger">
                {getMoney(sales.total)}
              </div>
              <div className="d-flex">
                <div className="child-col-item">
                  <div className="numb numb-2">
                    <span className="text-success">
                      {getMoney(sales.total_new)}
                    </span>
                  </div>
                  <div className="text-descript w-100">
                    Mới ( {formatNumber(sales.total_new_percent, 1)}% )
                  </div>
                </div>
                <div className="child-col-item">
                  <div className="numb numb-2">
                    <span className="text-success">
                      {getMoney(sales.total_old)}
                    </span>
                  </div>
                  <div className="text-descript w-100">
                    Cũ ( {formatNumber(sales.total_old_percent, 1)}% )
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex">
              <div className="child-col-item">
                <div className="text-descript w-100">Doanh số hóa đơn đầu</div>
                <div className="numb text-danger">
                  {getMoney(sales.first.total)}
                </div>
                <div className="d-flex d-flex-center">
                  <div className="child-col-item">
                    <div className="numb numb-2">
                      <span className="text-success">
                        {getMoney(sales.first.total_new)}
                      </span>
                    </div>
                    <div className="text-descript w-100">
                      Mới ( {formatNumber(sales.first.total_new_percent, 1)}% )
                    </div>
                  </div>
                  <div className="child-col-item">
                    <div className="numb numb-2">
                      <span className="text-success">
                        {getMoney(sales.first.total_old)}
                      </span>
                    </div>
                    <div className="text-descript w-100">
                      Cũ ( {formatNumber(sales.first.total_old_percent, 1)}% )
                    </div>
                  </div>
                </div>
              </div>
              <div className="child-col-item">
                <div className="text-descript w-100">
                  Trung bình doanh số hóa đơn đầu / khách
                </div>
                <div className="numb text-danger">
                  {getMoney(sales.average_cus_first.total)}
                </div>
                <div className="d-flex d-flex-center">
                  <div className="child-col-item">
                    <div className="numb numb-2 text-success">
                      {getMoney(sales.average_cus_first.total_new)}
                    </div>
                    <div className="text-descript w-100">Mới</div>
                  </div>
                  <div className="child-col-item">
                    <div className="numb numb-2 text-success">
                      {getMoney(sales.average_cus_first.total_old)}
                    </div>
                    <div className="text-descript w-100">Cũ</div>
                  </div>
                </div>
              </div>
              <div className="child-col-item">
                <div className="text-descript w-100">
                  Trung bình doanh số / khách
                </div>
                <div className="numb text-danger">
                  {getMoney(sales.average_cus.total)}
                </div>
                <div className="d-flex d-flex-center">
                  <div className="child-col-item">
                    <div className="numb numb-2 text-success">
                      {getMoney(sales.average_cus.total_new)}
                    </div>
                    <div className="text-descript w-100">Mới</div>
                  </div>
                  <div className="child-col-item">
                    <div className="numb numb-2 text-success">
                      {getMoney(sales.average_cus.total_old)}
                    </div>
                    <div className="text-descript w-100">Cũ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default Reportsv2;
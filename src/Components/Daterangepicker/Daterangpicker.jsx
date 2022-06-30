import $ from "jquery";
import "../../Assets/plugins/daterangepicker/daterangepicker.css";
import "../../Assets/plugins/daterangepicker/daterangepicker.js";
import moment from "moment";
import PropTypes from "prop-types";
import { PureComponent, createRef } from "react";
class Daterangpicker extends PureComponent {
  constructor(props) {
    super(props);
    if (!this.props.innerRef) this.innerRef = createRef();
  }
  componentDidMount() {
    $(this.innerRef.current).daterangepicker(this.props.options);
  }
  componentWillUnmount() {
    $(this.innerRef.current).daterangepicker("destroy");
  }
  render() {
    return <input ref={this.innerRef} type="text" {...this.props}/>;
  }
}
export default Daterangpicker;

Daterangpicker.propTypes = {
  options: PropTypes.object,
};

Daterangpicker.defaultProps = {
  options: {
    opens: "right",
    alwaysShowCalendars: true,
    showCustomRangeLabel: false,
    startDate: moment().format("MM/DD/YYYY"),
    endDate: moment().format("MM/DD/YYYY"),
    ranges: {
      "Hôm nay": [moment(), moment()],
      "Hôm qua": [moment().subtract(1, "days"), moment().subtract(1, "days")],
      "7 ngày trước": [moment().subtract(6, "days"), moment()],
      "30 ngày trước": [moment().subtract(29, "days"), moment()],
      "Tháng ngày": [moment().startOf("month"), moment().endOf("month")],
      "Tháng trước": [
        moment().subtract(1, "month").startOf("month"),
        moment().subtract(1, "month").endOf("month"),
      ],
    },
  },
};

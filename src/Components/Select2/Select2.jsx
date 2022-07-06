import $ from "jquery";
import PropTypes from "prop-types";
import { PureComponent } from "react";
import "../../Assets/plugins/select2/select2.min.css";
import "../../Assets/plugins/select2/select2.min.js";

export default class Select2 extends PureComponent {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    const option = this.props.options;
    $(this.select2).select2(option);
    if (typeof this.props.onChange === "function") {
      $(this.select2).on("change", (e) => {
        this.props.onChange(e);
      });
    }
  }
  componentDidUpdate(prevProps) {
    if (prevProps.children !== this.props.children) {
      console.log(`updated`);
      $(this.select2).change();
    }
  }
  componentWillUnmount() {
    $(this.select2).select2("destroy");
  }
  render() {
    const { ...attributes } = this.props;
    delete attributes.ref;
    delete attributes.children;
    delete attributes.options;
    return (
      <select ref={el => this.select2 = el} {...attributes}>
        {this.props.children}
      </select>
    );
  }
}

Select2.propTypes = {
  options: PropTypes.object,
};

Select2.defaultProps = {
  options: {},
};

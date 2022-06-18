import "../../Assets/Styles/marketing_offlines/style.css";
import "../../Assets/Styles/marketing_offlines/reports.css";
import { PureComponent } from "react";
import AdvancedMenu from "./Components/AdvancedMenu";
import Select2 from "../../Components/Select2/Select2";
import axiosClient from "../../Api/axiosClient";
export default class Reports_v2 extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      filter: {
        pg: {},
        channel: {},
      },
    };
  }

  componentDidMount() {
    const get_partner = axiosClient.get("marketing_offlines/ajax_get_partners");
    const get_channel = axiosClient.get(
      "marketing_offlines/ajax_get_required_channels"
    );
    Promise.all([get_partner, get_channel]).then(([partners, channels]) => {
      this.setState({
        filter: {
          pg: {
            data: partners.data.data,
          },
          channel: {
            data: channels.data,
          },
        },
      });
    });
  }

  render() {
    return (
      <>
        <AdvancedMenu />
        <div className="bg-content">
          <div className="box-header box-filter">
            <form className="row">
              <div className="form-group col-sm-2 col-xs-6">
                <input type="text" className="form-control" disabled/>
              </div>
              <div className="form-group col-sm-3 col-xs-6">
                <input type="text" className="form-control" />
              </div>
              <div className="form-group col-sm-2 col-xs-6">
                <Select2 options={{ width: "100%" }}>
                  <>
                    <option value="0">Tất cả kênh</option>
                    {this.state.filter.channel.data &&
                      this.state.filter.channel.data.map((item) => {
                        return (
                          <option key={`channel_` + item.id} value={item.id}>
                            {item.name}
                          </option>
                        );
                      })}
                  </>
                </Select2>
              </div>
              <div className="form-group col-sm-2 col-xs-6">
                <input type="text" className="form-control" />
              </div>
              <div className="form-group col-sm-2 col-xs-6">
                <Select2 options={{ width: "100%" }}>
                  <>
                    <option value="0">Tất cả PG</option>
                    {this.state.filter.pg.data &&
                      this.state.filter.pg.data.map((item) => {
                        return (
                          <option key={`pg_` + item.id} value={item.id}>
                            {item.name}
                          </option>
                        );
                      })}
                  </>
                </Select2>
              </div>
              <div className="form-group col-sm-1 col-xs-6">
                <button className="btn btn-primary btn submit-btn pointer btn-block">
                  <i className="fa fa-search" aria-hidden="true"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }
}

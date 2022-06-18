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
        campaigns: {},
      },
      campaigns_search: "",
    };
    this.setTextSearchCampaign = this.setTextSearchCampaign.bind(this);
  }

  setTextSearchCampaign(e) {
    this.get_campaign(e.target.value);
  }

  get_campaign(key) {
    axiosClient
      .get("marketing_offlines/ajax_search_campaigns", {
        key: key,
      })
      .then((response) => {
        this.setState({    
          ...this.state.filter,
          campaigns: {
            data: response.data.data,
          }
        });
      });
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
                <input type="text" className="form-control" disabled />
              </div>
              <div className="form-group col-sm-3 col-xs-6">
                <div className="loading_input po-r">
                  <div className="search-content po-r">
                    <i className="fa fa-search"></i>
                    <input
                      type="text"
                      className="form-control input"
                      placeholder="Nhập tên chương trình"
                      onKeyUp={this.setTextSearchCampaign}
                      onClick={this.setTextSearchCampaign}
                    />
                  </div>
                </div>
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
                <div className="loading_input po-r">
                  <div className="search-content po-r">
                    <i className="fa fa-search"></i>
                    <input
                      type="text"
                      className="form-control input"
                      placeholder="Nhập tên địa điểm"
                    />
                  </div>
                </div>
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
        <div className="mgt-10 overview po-r text-center">
          Vui lòng chọn chương trình cần xem thống kê
        </div>
      </>
    );
  }
}

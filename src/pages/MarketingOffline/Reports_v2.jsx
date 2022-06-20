import "../../Assets/Styles/marketing_offlines/style.css";
import "../../Assets/Styles/marketing_offlines/reports.css";
import React, { PureComponent } from "react";
import AdvancedMenu from "./Components/AdvancedMenu";
import Select2 from "../../Components/Select2/Select2";
import axiosClient from "../../Api/axiosClient";
import debounce from "lodash/debounce";
import Reportsv2 from "./Components/Reportsv2";
import Daterangpicker from "../../Components/Daterangepicker/Daterangpicker";
import { formatDate } from "../../Hooks";

export default class Reports_v2 extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      filter: {},
      campaigns_search: "",
      campaign_selected: { id: 0, name: "" },
      location_selected: { id: 0, name: "" },
      date: "",
      channel_id: 0,
    };
    this.setTextSearchCampaign = this.setTextSearchCampaign.bind(this);
    this.setTextSearchLocation = this.setTextSearchLocation.bind(this);
    this.chooseCampaign = this.chooseCampaign.bind(this);
    this.chooseLocation = this.chooseLocation.bind(this);
    this.showCampaign = React.createRef();
    this.showLocation = React.createRef();
  }

  handleSearchCampaign = debounce((key) => {
    this.getCampaign(key);
  }, 500);

  handleSearchLocation = debounce((key) => {
    this.getLocation(key);
  }, 500);

  removeCampaign(e) {
    this.setState((prevState) => ({
      ...prevState,
      campaign_selected: {
        id: 0,
        name: "",
      },
      date: "",
    }));
    this.getParnter(0);
    this.getLocation();
    this.removeLocation();
  }

  removeLocation(e) {
    this.setState((prevState) => ({
      ...prevState,
      location_selected: {
        id: 0,
        name: "",
      },
    }));
    this.getParnter(0);
  }

  chooseCampaign(item) {
    this.setState((prevState) => ({
      ...prevState,
      campaign_selected: { id: item.id, name: item.name },
      date: {
        start_date: `${formatDate(item.start_date)}`,
        end_date: `${formatDate(item.end_date)}`,
      },
    }));
    this.getParnter(item.id);
    this.showCampaign.current.classList.add("hidden");
  }

  chooseLocation(item) {
    this.setState((prevState) => ({
      ...prevState,
      location_selected: { id: item.id, name: item.name },
    }));
    this.showLocation.current.classList.add("hidden");
  }

  setTextSearchCampaign(e) {
    this.handleSearchCampaign(e.target.value);
  }

  setTextSearchLocation(e) {
    this.handleSearchLocation(e.target.value);
  }

  getCampaign(key = "") {
    axiosClient
      .get("marketing_offlines/ajax_search_campaigns", {
        params: { key: key },
      })
      .then((response) => {
        this.setState((prevState) => ({
          filter: {
            ...prevState.filter,
            campaigns: {
              data: response.data,
            },
          },
        }));
      });
  }

  getLocation(key = "") {
    axiosClient
      .post("marketing_offlines/ajax_search_locations", {
        campaign_id: this.state.campaign_selected.id,
        channel_id: this.state.channel_id,
        key: key,
      })
      .then((response) => {
        this.setState((prevState) => ({
          filter: {
            ...prevState.filter,
            location: {
              data: response.data,
            },
          },
        }));
      });
  }

  getParnter(campaign_id = 0) {
    axiosClient
      .get("marketing_offlines/ajax_get_partners", {
        params: { filter: JSON.stringify({ campaign_id: campaign_id }) },
      })
      .then((response) => {
        this.setState((prevState) => ({
          filter: {
            ...prevState.filter,
            pg: {
              data: response.data.data,
            },
          },
        }));
      });
  }

  getChannel() {
    axiosClient
      .get("marketing_offlines/ajax_get_required_channels")
      .then((response) => {
        this.setState((prevState) => ({
          filter: {
            ...prevState.filter,
            channel: {
              data: response.data,
            },
          },
        }));
      });
  }

  componentDidMount() {
    this.getChannel();
    this.getLocation();
    this.getCampaign();
    this.getParnter();
    document.addEventListener(`click`, (e) => {
      if (
        this.showCampaign.current &&
        this.showLocation.current &&
        !e.target.classList.contains("input")
      ) {
        this.showCampaign.current.classList.add("hidden");
        this.showLocation.current.classList.add("hidden");
      }
    });
  }

  getReport() {
    axiosClient
      .post("marketing_offlines/get_reports_marketing", {
        campaign_id: this.state.campaign_selected.id,
        campaign_name: this.state.campaign_selected.name,
        channel_id: this.state.channel_id,
        date: `${this.state.date.start_date} - ${this.state.date.end_date}`,
        import_id: "0",
        loading: true,
        location_id: this.state.location_selected.id,
        location_name: this.state.location_selected.name,
      })
      .then((response) => {
        this.setState({
          report: response.data,
        });
      });
  }

  render() {
    return (
      <>
        <AdvancedMenu />
        <div className="bg-content">
          <div className="box-header box-filter">
            <div className="row">
              <div className="form-group col-sm-2 col-xs-6">
                <Daterangpicker
                  className="form-control"
                  disabled={!this.state.date ? "disabled" : false}
                  value={
                    this.state.date &&
                    `${this.state.date.start_date} - ${this.state.date.end_date}`
                  }
                  placeholder="Thời gian chương trình"
                  options={{
                    opens: "right",
                    alwaysShowCalendars: true,
                    showCustomRangeLabel: false,
                    minDate: this.state.date.start_date,
                    maxDate: this.state.date.end_date,
                    startDate: this.state.date.start_date,
                    endDate: this.state.date.end_date,
                    locale: {
                      format: "DD/MM/YYYY",
                    },
                  }}
                />
              </div>
              <div className="form-group col-sm-3 col-xs-6">
                {!this.state.campaign_selected.id && (
                  <div
                    className={
                      "po-r" +
                      (!this.state.filter.campaigns ? " loading_input" : "")
                    }
                  >
                    <div className="search-content po-r">
                      <i className="fa fa-search"></i>
                      <input
                        type="text"
                        className="form-control input"
                        placeholder="Nhập tên chương trình"
                        onKeyUp={this.setTextSearchCampaign}
                        onClick={(e) => {
                          this.setTextSearchCampaign(e);
                          this.showCampaign.current.classList.remove("hidden");
                        }}
                      />
                    </div>
                  </div>
                )}
                {this.state.campaign_selected.id !== 0 && (
                  <ul className="list-group mg-0">
                    <input type="hidden" value="0" />
                    <li className="list-group-item form-control">
                      <span className="text-max-line line-1">
                        {this.state.campaign_selected.name}
                      </span>
                      <span
                        className="btn btn-xs badge"
                        onClick={(e) => {
                          this.removeCampaign(e);
                        }}
                      >
                        x
                      </span>
                    </li>
                  </ul>
                )}
                <div
                  className="search-result po-r hidden"
                  ref={this.showCampaign}
                >
                  {this.state.filter.campaigns && (
                    <ul>
                      {this.state.filter.campaigns.data.map((item, index) => {
                        return (
                          <li
                            key={item.id}
                            onClick={() => {
                              this.chooseCampaign(item);
                            }}
                          >
                            {item.name}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
              <div className="form-group col-sm-2 col-xs-6">
                <Select2
                  options={{ width: "100%" }}
                  onChange={(e) => {
                    this.setState(
                      {
                        channel_id: e.target.value,
                      },
                      () => {
                        this.getLocation();
                        this.setState((prevState) => ({
                          ...prevState,
                          location_selected: {
                            id: 0,
                            name: "",
                          },
                        }));
                      }
                    );
                  }}
                >
                  <>
                    <option value="0">Tất cả kênh</option>
                    {this.state.filter.channel &&
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
                {!this.state.location_selected.id && (
                  <div
                    className={
                      "po-r" +
                      (!this.state.filter.location ? " loading_input" : "")
                    }
                  >
                    <div className="search-content po-r">
                      <i className="fa fa-search"></i>
                      <input
                        type="text"
                        className="form-control input"
                        placeholder="Nhập tên địa điểm"
                        onKeyUp={this.setTextSearchLocation}
                        onClick={(e) => {
                          this.setTextSearchLocation(e);
                          this.showLocation.current.classList.remove("hidden");
                        }}
                      />
                    </div>
                  </div>
                )}
                {this.state.location_selected.id !== 0 && (
                  <ul className="list-group mg-0">
                    <li className="list-group-item form-control">
                      <span className="text-max-line line-1">
                        {this.state.location_selected.name}
                      </span>
                      <span
                        className="btn btn-xs badge"
                        onClick={(e) => {
                          this.removeLocation(e);
                        }}
                      >
                        x
                      </span>
                    </li>
                  </ul>
                )}
                <div
                  className={"search-result po-r hidden"}
                  ref={this.showLocation}
                >
                  {this.state.filter.location && (
                    <ul>
                      {this.state.filter.location.data.map((item, index) => {
                        return (
                          <li
                            key={item.id}
                            onClick={() => {
                              this.chooseLocation(item);
                            }}
                          >
                            {item.name}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
              <div className="form-group col-sm-2 col-xs-6">
                <Select2
                  options={{ width: "100%" }}
                  onChange={(e) => {
                    this.setState((prevState) => {
                      return {
                        ...prevState,
                        pg: e.target.value,
                      };
                    });
                  }}
                >
                  <>
                    <option value="0">Tất cả PG</option>
                    {this.state.filter.pg &&
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
                <button
                  className="btn btn-primary btn submit-btn pointer btn-block"
                  onClick={() => this.getReport()}
                >
                  <i className="fa fa-search" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        {this.state.report && <Reportsv2 {...this.state.report} />}
        {!this.state.report && (
          <div className="mgt-10 overview po-r text-center">
            Vui lòng chọn chương trình cần xem thống kê
          </div>
        )}
      </>
    );
  }
}

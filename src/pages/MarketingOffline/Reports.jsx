import "../../Assets/Styles/marketing_offlines/style.css";
import "../../Assets/Styles/marketing_offlines/reports.css";
import AdvancedMenu from "./Components/AdvancedMenu";
import Select2 from "../../Components/Select2/Select2";
import debounce from "lodash/debounce";
import Daterangpicker from "../../Components/Daterangepicker/Daterangpicker";
import { formatDate } from "../../Hooks";
import { useRef, useState, useEffect } from "react";
import MarketingOffline from "../../Api/MarketingOffline";
import ReportPG from "./Components/ReportPG";
import moment from "moment";

export default function Reports_v2() {
  const [filter, setFilter] = useState({});
  const [campaignSelected, setCampaignSelected] = useState({ id: 0, name: "" });
  const [locationSelected, setLocationSelected] = useState({ id: 0, name: "" });
  const [date, setDate] = useState({
    start_date: moment().startOf("month").format("DD/MM/YYYY"),
    end_date: moment().format("DD/MM/YYYY"),
  });
  const [channelId, setChannelId] = useState(0);
  const [report, setReport] = useState([]);
  const showCampaign = useRef();
  const showLocation = useRef();
  useEffect(() => {
    getChannel();
    getLocation();
    getCampaign();
    getParnter();
    getReport();
    document.addEventListener(`click`, clickOutSide);
    return () => {
      document.removeEventListener(`click`, clickOutSide);
    };
  }, []);

  useEffect(() => {
    getLocation();
  }, [channelId]);

  const clickOutSide = (e) => {
    if (
      showCampaign.current &&
      showLocation.current &&
      !e.target.classList.contains("input")
    ) {
      showCampaign.current.classList.add("hidden");
      showLocation.current.classList.add("hidden");
    }
  };

  const getCampaign = (key = "") => {
    MarketingOffline.getCampaign({ key: key }).then((response) => {
      setFilter((prevState) => {
        return {
          ...prevState,
          campaigns: {
            data: response.data,
          },
        };
      });
    });
  };

  const getLocation = (key = "") => {
    MarketingOffline.getLocation({
      campaign_id: campaignSelected.id,
      channel_id: channelId,
      key: key,
    }).then((response) => {
      setFilter((prevState) => {
        return {
          ...prevState,
          location: {
            data: response.data,
          },
        };
      });
    });
  };

  const getParnter = (campaign_id = 0) => {
    MarketingOffline.getParnter({
      filter: JSON.stringify({ campaign_id: campaign_id }),
    }).then((response) => {
      setFilter((prevState) => {
        return {
          ...prevState,
          pg: {
            data: response.data.data,
          },
        };
      });
    });
  };

  const getChannel = () => {
    MarketingOffline.getChannel().then((response) => {
      setFilter((prevState) => {
        return {
          ...prevState,
          channel: {
            data: response.data,
          },
        };
      });
    });
  };

  const handleSearchCampaign = debounce((key) => {
    getCampaign(key);
  }, 500);

  const handleSearchLocation = debounce((key) => {
    getLocation(key);
  }, 500);

  const removeCampaign = (e) => {
    setCampaignSelected({ id: 0, name: "" });
    setDate({});
    getParnter(0);
    getLocation();
    removeLocation();
  };

  const removeLocation = (e) => {
    setLocationSelected({ id: 0, name: "" });
    getParnter(0);
  };

  const chooseCampaign = (item) => {
    setCampaignSelected((prevState) => {
      return {
        ...prevState,
        id: item.id,
        name: item.name,
      };
    });
    setDate((prevState) => {
      return {
        ...prevState,
        start_date: `${formatDate(item.start_date)}`,
        end_date: `${formatDate(item.end_date)}`,
      };
    });
    getParnter(item.id);
    showCampaign.current.classList.add("hidden");
  };

  const chooseLocation = (item) => {
    setLocationSelected((prevState) => {
      return {
        ...prevState,
        id: item.id,
        name: item.name,
      };
    });
    showLocation.current.classList.add("hidden");
  };

  const setTextSearchCampaign = (e) => {
    handleSearchCampaign(e.target.value);
  };

  const setTextSearchLocation = (e) => {
    handleSearchLocation(e.target.value);
  };

  const getReport = () => {
    MarketingOffline.getReportPG({
      campaign_id: campaignSelected.id,
      campaign_name: campaignSelected.name,
      channel_id: channelId,
      date: `${date.start_date} - ${date.end_date}`,
      import_id: "0",
      location_id: locationSelected.id,
    }).then((response) => {
      setReport(response.data);
    });
  };

  return (
    <>
      <AdvancedMenu />
      <div className="bg-content">
        <div className="box-header box-filter">
          <div className="row">
            <div className="form-group col-sm-2 col-xs-6">
              {
                <Daterangpicker
                  className="form-control"
                  disabled={Object.keys(date).length === 0 ? "disabled" : false}
                  placeholder="Thời gian chương trình"
                  options={{
                    opens: "right",
                    alwaysShowCalendars: true,
                    showCustomRangeLabel: false,
                    minDate: date.start_date,
                    maxDate: date.end_date,
                    startDate: date.start_date,
                    endDate: date.end_date,
                    locale: {
                      format: "DD/MM/YYYY",
                    },
                  }}
                />
              }
            </div>
            <div className="form-group col-sm-3 col-xs-6">
              {!campaignSelected.id && (
                <div
                  className={
                    "po-r" + (!filter.campaigns ? " loading_input" : "")
                  }
                >
                  <div className="search-content po-r">
                    <i className="fa fa-search"></i>
                    <input
                      type="text"
                      className="form-control input"
                      placeholder="Nhập tên chương trình"
                      onKeyUp={setTextSearchCampaign}
                      onClick={(e) => {
                        setTextSearchCampaign(e);
                        showCampaign.current.classList.remove("hidden");
                      }}
                    />
                  </div>
                </div>
              )}
              {campaignSelected.id !== 0 && (
                <ul className="list-group mg-0">
                  <input type="hidden" value="0" />
                  <li className="list-group-item form-control">
                    <span className="text-max-line line-1">
                      {campaignSelected.name}
                    </span>
                    <span
                      className="btn btn-xs badge"
                      onClick={(e) => {
                        removeCampaign(e);
                      }}
                    >
                      x
                    </span>
                  </li>
                </ul>
              )}
              <div className="search-result po-r hidden" ref={showCampaign}>
                {filter.campaigns && (
                  <ul>
                    {filter.campaigns.data.map((item, index) => {
                      return (
                        <li
                          key={item.id}
                          onClick={() => {
                            chooseCampaign(item);
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
                  setChannelId(e.target.value);
                  setLocationSelected((prevState) => {
                    return {
                      ...prevState,
                      id: 0,
                      name: "",
                    };
                  });
                }}
              >
                <>
                  <option value="0">Tất cả kênh</option>
                  {filter.channel &&
                    filter.channel.data.map((item) => {
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
              {!locationSelected.id && (
                <div
                  className={
                    "po-r" + (!filter.location ? " loading_input" : "")
                  }
                >
                  <div className="search-content po-r">
                    <i className="fa fa-search"></i>
                    <input
                      type="text"
                      className="form-control input"
                      placeholder="Nhập tên địa điểm"
                      onKeyUp={setTextSearchLocation}
                      onClick={(e) => {
                        setTextSearchLocation(e);
                        showLocation.current.classList.remove("hidden");
                      }}
                    />
                  </div>
                </div>
              )}
              {locationSelected.id !== 0 && (
                <ul className="list-group mg-0">
                  <li className="list-group-item form-control">
                    <span className="text-max-line line-1">
                      {locationSelected.name}
                    </span>
                    <span
                      className="btn btn-xs badge"
                      onClick={(e) => {
                        removeLocation(e);
                      }}
                    >
                      x
                    </span>
                  </li>
                </ul>
              )}
              <div className={"search-result po-r hidden"} ref={showLocation}>
                {filter.location && (
                  <ul>
                    {filter.location.data.map((item, index) => {
                      return (
                        <li
                          key={item.id}
                          onClick={() => {
                            chooseLocation(item);
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
              <Select2 options={{ width: "100%" }}>
                <>
                  <option value="0">Tất cả PG</option>
                  {filter.pg &&
                    filter.pg.data.map((item) => {
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
              <div className="input-group form-serch-submit d-flex-bw">
                <button
                  title="Tìm kiếm"
                  type="submit"
                  className="btn-primary btn submit-btn pointer"
                  onClick={() => getReport()}
                >
                  <i className="fa fa-search" aria-hidden="true"></i>
                </button>
                <a
                  title="Xem báo cáo tư vấn viên"
                  href="sale_care/report?source_id=[31]&amp;source_view=true"
                  className="btn btn-sm btn-info pointer"
                >
                  <i className="fa fa-line-chart" aria-hidden="true"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ReportPG rows={report} />
    </>
  );
}

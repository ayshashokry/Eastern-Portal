import React, { Component } from "react";
import { Container } from "react-bootstrap";
import { Form, Row, Col, Input, Radio, Select, Button, Tooltip } from "antd";
import { CloudUploadOutlined } from "@material-ui/icons";
import moment from "moment-hijri";
import Loader from "../../../containers/Loader";
import DatePicker from "react-multi-date-picker";

import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
export default class EditOwner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.oData.name,
      gender: this.props.oData.subtype,
      IdTypeObject: this.props.oData.nationalidtypes,
      IdType: this.props.oData.nationalidtypes.name,
      IdNumber: this.props.oData.ssn,
      IdSide: this.props.oData.nationalid_issuer_name,
      nationalityObject: this.props.oData.nationalities,
      selectedNationality: this.props.oData.nationalities.local_name,
      phoneNumber: this.props.oData.phone,
      mobileNumber: this.props.oData.mobile,
      birthDate: this.props.oData.date_of_birth,
      email: this.props.oData.email,
      address: this.props.oData.address,
      IdImage: this.props.oData.image,
      loading: false,
      IdTypes: [],
      nationalities: [],
      idError: "",
      errorMsg: "",
      imageError: "",
      imageConfirm: "",
    };
    this.formRef = React.createRef();
  }
  componentDidMount() {
    axios.get(`${window.ApiUrl}/api/NatinalIdTypes`).then((res) => {
      this.setState({
        IdTypes: res.data.results,
        loading: false,
      });
    });
  }
  handleUserInput = (e) => {
    if (e.target.value.length > 12 && e.target.name === "phoneNumber") {
      e.target.value = e.target.value.slice(0, 12);
      this.setState({ phoneNumber: e.target.value.slice(0, 12) });
    }

    if (this.state.IdType !== null && e.target.name === "IdNumber") {
      axios
        .get(
          `${window.ApiUrl}/owners/ownerExists?q=${e.target.value}&owner_type=1`
        )
        .then((res) => {
          if (res) {
            this.setState({
              loading: false,
              // idError: "?????? ???????????? ???????? ???? ??????",
            });
          } else {
            this.setState({
              loading: false,
              idError: "",
            });
          }
        })
        .catch((error) => {
          if (error.response.status === 409) {
            this.setState({
              loading: false,
              idError: "?????? ???????????? ???????? ???? ??????",
            });
          }
        });
    }
    if (
      (this.state.IdType === null || this.state.IdType === undefined) &&
      e.target.name === "IdNumber"
    ) {
      e.target.value = e.target.value.slice(0, 0);
      this.setState({
        idError: "???? ???????? ???????? ?????? ???????????? ????????",
        IdNumber: e.target.value.slice(0, 0),
      });
    }

    const name = e.target.name;
    const value = e.target.value;
    this.setState({ [name]: value, errorMsg: "" });
  };

  keyPressMobile = (e) => {
    return /[\d]/.test(String.fromCharCode(e.target.value.keyCode));
  };

  handleDateChangeRaw = (e) => {
    e.preventDefault();
  };
  handleChangeIdType = (value, e) => {
    this.formRef.current.setFieldsValue({
      IdNumber: "",
      selectedNationality: null,
    });
    // this.setState({ IdType: null, IdNumber: "" });
    if (e !== undefined) {
      this.setState({
        IdType: value,
        idError: "",
        loading: true,
        // IdNumber: "",
      });
      this.setState({
        IdTypeObject: this.state.IdTypes.filter((type) => type.id === e.id)[0],
      });
      axios
        .get(
          `${window.ApiUrl}/api/Nationalities/?filter_key=nationalty_type_id&operand=%3D&q=${e.id}`
        )
        .then((res) => {
          this.setState({ loading: false, nationalities: res.data.results });
        });
    }
  };

  setFile = async (e) => {
    if (e.target.files.length !== 0) {
      this.setState({ loading: true, imageError: "" });
      const formData = new FormData();
      if (e.target.files) {
        formData.append(`file1`, e.target.files[0]);
      }

      await axios
        .post(window.ApiUrl + "/uploadMultifiles", formData)
        .then(
          (res) => (
            this.setState(
              {
                loading: false,
                IdImage: res.data[0].data,
                imageConfirm: "???? ?????????? ???????? ???????????? ??????????",
                imageError: "",
              },
              () => (e.target.value = null)
            ),
            this.formRef.current.setFieldsValue({
              IdImage: res.data[0].data,
            })
          )
        )
        .catch((error) => {
          this.setState({ loading: false, IdImage: null });
          if (error.response.status === 500) {
            this.setState({
              imageError: "?????? ?????? ?????????? ??????????????, ???????? ?????? ????????",
              IdImage: null,
              imageConfirm: "",
            });
          }
        });
    }
  };
  handleChangeNationality = (value, e) => {
    if (e !== undefined) {
      this.setState({
        selectedNationality: value,
        nationalityObject: this.state.nationalities.filter(
          (type) => type.id === e.id
        )[0],
      });
    }
  };

  editOwner = (e) => {
    let addedOwners = [];

    addedOwners.splice(this.props.index, 1);
    addedOwners.splice(this.props.index, 0, {
      address: this.state.address,
      date_of_birth: this.state.birthDate,
      email: this.state.email,
      image: this.state.IdImage,
      mobile: this.state.mobileNumber,
      "mobile-part": this.state.mobileNumber,
      name: this.state.name,
      nationalid_issuer_name: this.state.IdSide,
      nationalidtype_id: this.state.IdTypeObject.id,
      nationalidtypes: this.state.IdTypeObject,
      nationalities: this.state.nationalityObject,
      nationality_id: this.state.nationalityObject.id,
      phone: this.state.phoneNumber,
      ssn: this.state.IdNumber,
      subtype: this.state.gender,
    });
    this.props.getAddOwners(addedOwners);
    this.props.biggetAddOwners(addedOwners);
    this.setState({
      name: "",
      gender: 1,
      IdTypeObject: {},
      IdType: null,
      IdNumber: "",
      IdSide: "",
      nationalityObject: {},
      selectedNationality: null,
      phoneNumber: "",
      mobileNumber: "",
      birthDate: null,
      email: "",
      address: "",
      IdImage: null,
      loading: false,
      idError: "",
      errorMsg: "",
      imageError: "",
      imageConfirm: "",
    });
    this.props.onHide();
  };

  render() {
    let today = new Date();
    let yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    console.log(this.props.oData);
    return (
      <Container fluid>
        <div>
          <h5 className="px-5 pt-4">
            <span>
              <FontAwesomeIcon
                icon={faTimes}
                className="fa-1x"
                onClick={this.props.onHide}
                style={{
                  textAlign: "left",
                  float: "left",
                  cursor: "pointer",
                }}
              />
            </span>{" "}
            ?????????? ???????????? ????????????
          </h5>
        </div>
        <Form
          onFinish={this.editOwner}
          ref={this.formRef}
          className="my-4 px-md-5 regForms"
          layout="vertical"
          name="validate_other"
          initialValues={{
            name: this.state.name,
            gender: this.state.gender,
            IdTypeObject: this.state.IdTypeObject,
            IdType: this.state.IdType,
            IdNumber: this.state.IdNumber,
            IdSide: this.state.IdSide,
            nationalityObject: this.state.nationalityObject,
            selectedNationality: this.state.selectedNationality,
            phoneNumber: this.state.phoneNumber,
            mobileNumber: this.state.mobileNumber,
            birthDate: this.state.birthDate,
            email: this.state.email,
            address: this.state.address,
            IdImage: this.state.IdImage,
          }}
        >
          {" "}
          {this.state.loading ? <Loader /> : null}{" "}
          <Row>
            <Col
              md={{ span: 24 }}
              sm={{ span: 24 }}
              xs={{ span: 24 }}
              className="px-2"
            >
              <Form.Item
                rules={[
                  {
                    message: "???? ???????? ???????? ??????????",
                    required: true,
                  },
                ]}
                name="name"
                hasFeedback
                label="??????????"
              >
                <Input
                  name="name"
                  onChange={this.handleUserInput}
                  value={this.state.name}
                  placeholder="??????????"
                />
              </Form.Item>
            </Col>
            <Col
              md={{ span: 12 }}
              sm={{ span: 24 }}
              xs={{ span: 24 }}
              className="px-2"
            >
              <Form.Item
                name="gender"
                label="?????????? "
                style={{ textAlign: "right" }}
              >
                <Radio.Group
                  // defaultValue={this.state.gender}
                  onChange={this.handleUserInput}
                  name="gender"
                  value={this.state.gender}
                >
                  <Radio value={1}>??????</Radio>
                  <Radio value={2}>????????</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col
              md={{ span: 12 }}
              sm={{ span: 24 }}
              xs={{ span: 24 }}
              className="px-2"
            >
              <Form.Item
                rules={[
                  {
                    message: "???? ???????? ???????? ?????? ????????????",
                    required: true,
                  },
                ]}
                name="IdType"
                hasFeedback
                label="?????? ????????????"
              >
                <Select
                  virtual={false}
                  showSearch
                  allowClear
                  onChange={this.handleChangeIdType}
                  value={this.state.IdTypeObject.name}
                  placeholder="???????? ?????? ????????????"
                  onClear={() => this.setState({ IdType: null })}
                  getPopupContainer={(trigger) => trigger.parentNode}
                >
                  {this.state.IdTypes && this.state.IdTypes.length !== 0
                    ? this.state.IdTypes.map((inq, index) => (
                        <Select.Option
                          className="selectgroup"
                          value={inq.name}
                          key={inq.id}
                          id={inq.id}
                          passport={inq.passport}
                        >
                          {inq.name}
                        </Select.Option>
                      ))
                    : null}
                </Select>
              </Form.Item>
            </Col>{" "}
            <Col
              md={{ span: 12 }}
              sm={{ span: 24 }}
              xs={{ span: 24 }}
              className="px-2"
            >
              <Form.Item
                name="IdNumber"
                hasFeedback
                label="?????? ????????????"
                rules={[
                  {
                    message: "???? ???????? ???????? ?????? ????????????",
                    required: true,
                  },
                  {
                    min:
                      this.state.IdTypeObject.id === 1890
                        ? 10
                        : this.state.IdTypeObject.id === 1990
                        ? 10
                        : 8,
                    message:
                      this.state.IdTypeObject.id === 1890
                        ? "?????? ???????????? ???? ?????? ???? 10 ??????????"
                        : this.state.IdTypeObject.id === 1990
                        ? "?????? ???????????? ???? ?????? ???? 10 ??????????"
                        : "?????? ???????????? ???? ?????? ???? 8 ??????????",
                  },
                  {
                    max:
                      this.state.IdTypeObject.id === 1890
                        ? 10
                        : this.state.IdTypeObject.id === 1990
                        ? 10
                        : 14,
                    message:
                      this.state.IdTypeObject.id === 1890
                        ? "?????? ???????????? ???? ???????? ???? 10 ??????????"
                        : this.state.IdTypeObject.id === 1990
                        ? "?????? ???????????? ???? ???????? ???? 10 ??????????"
                        : "?????? ???????????? ???? ???????? ???? 14 ??????",
                  },
                  {
                    pattern:
                      this.state.IdTypeObject.id === 1890
                        ? new RegExp(/^1/)
                        : this.state.IdTypeObject.id === 1990
                        ? new RegExp(/^2/)
                        : null,
                    message:
                      this.state.IdTypeObject.id === 1890
                        ? "?????? ???? ???????? ?????? ???????????? ???????????? 1"
                        : this.state.IdTypeObject.id === 1990
                        ? "?????? ???? ???????? ?????? ???????????? ???????????? 2"
                        : null,
                  },
                ]}
              >
                <Input
                  // disabled={this.state.IdType === null ? true : false}
                  type="number"
                  onChange={this.handleUserInput}
                  onInput={this.handleUserInput}
                  onKeyPress={this.keyPressMobile}
                  name="IdNumber"
                  value={this.state.IdNumber}
                  placeholder="???????? ?????? ????????????"
                />
              </Form.Item>
              {this.state.idError !== "" ? (
                <p className="errMsg">{this.state.idError}</p>
              ) : null}
            </Col>
            <Col
              md={{ span: 12 }}
              sm={{ span: 24 }}
              xs={{ span: 24 }}
              className="px-2"
            >
              <Form.Item
                rules={[
                  {
                    message: "???? ???????? ???????? ?????? ?????????? ????????????",
                    required: true,
                  },
                ]}
                name="IdSide"
                hasFeedback
                label="?????? ?????????? ????????????"
              >
                <Input
                  name="IdSide"
                  onChange={this.handleUserInput}
                  value={this.state.IdSide}
                  placeholder="?????? ?????????? ????????????"
                />
              </Form.Item>
            </Col>
            <Col
              md={{ span: 12 }}
              sm={{ span: 24 }}
              xs={{ span: 24 }}
              className="px-2"
            >
              <Form.Item
                rules={[
                  {
                    message: "???? ???????? ???????? ??????????????",
                    required: true,
                  },
                ]}
                name="selectedNationality"
                hasFeedback
                label="??????????????"
              >
                <Select
                  virtual={false}
                  showSearch
                  allowClear
                  value={this.state.nationalityObject.local_name}
                  className="dont-show"
                  onChange={this.handleChangeNationality}
                  placeholder="???????? ??????????????"
                  getPopupContainer={(trigger) => trigger.parentNode}
                  disabled={this.state.IdType === null ? true : false}
                >
                  {this.state.nationalities &&
                  this.state.nationalities.length !== 0
                    ? this.state.nationalities.map((inq, index) => (
                        <Select.Option
                          title={
                            this.state.IdType === null ? null : inq.local_name
                          }
                          className="selectgroup"
                          value={inq.local_name}
                          key={inq.id}
                          id={inq.id}
                          passport={inq.nationalidtypes.passport}
                        >
                          {inq.local_name}
                        </Select.Option>
                      ))
                    : null}
                </Select>
              </Form.Item>
            </Col>
            <Col
              md={{ span: 12 }}
              sm={{ span: 24 }}
              xs={{ span: 24 }}
              className="px-2 phoneNum"
            >
              <Form.Item
                hasFeedback
                name="phoneNumber"
                label="?????? ????????????"
                rules={[
                  {
                    message: "???? ???????? ???????? ?????? ????????????",
                    required: true,
                  },
                  {
                    max: 9,
                    message: "?????? ???????????? ???? ???????? ???? 9 ??????????",
                  },
                  {
                    min: 9,
                    message: "?????? ???????????? ???? ?????? ???? 9 ??????????",
                  },
                ]}
              >
                <Input
                  addonAfter="966"
                  type="number"
                  onChange={this.handleUserInput}
                  name="phoneNumber"
                  value={this.state.phoneNumber}
                  placeholder="???????? ?????? ????????????"
                />
              </Form.Item>
            </Col>
            <Col
              md={{ span: 12 }}
              sm={{ span: 24 }}
              xs={{ span: 24 }}
              className="px-2 phoneNum"
            >
              <Form.Item
                name="mobileNumber"
                hasFeedback
                label="?????? ????????????"
                rules={[
                  {
                    message: "???? ???????? ???????? ?????? ????????????",
                    required: true,
                    max: "9999",
                  },
                  {
                    max: 9,
                    message: "?????? ???????????? ???? ???????? ???? 9 ??????????",
                  },
                  {
                    min: 9,
                    message: "?????? ???????????? ???? ?????? ???? 9 ??????????",
                  },
                  {
                    pattern: new RegExp(/^5/),
                    message: "?????? ???? ???????? ?????? ???????????? ???????????? 5",
                  },
                ]}
              >
                <Input
                  addonAfter="966"
                  type="number"
                  onChange={this.handleUserInput}
                  name="mobileNumber"
                  value={this.state.mobileNumber}
                  placeholder="???????? ?????? ????????????"
                />
              </Form.Item>
            </Col>
            <Col
              md={{ span: 12 }}
              sm={{ span: 24 }}
              xs={{ span: 24 }}
              className="px-2"
            >
              <Form.Item
                name="birthDate"
                hasFeedback
                label="?????????? ??????????????"
                rules={[
                  {
                    message: "???? ???????? ???????? ?????????? ??????????????",
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  editable={false}
                  value={this.state.birthDate}
                  maxDate={yesterday}
                  onChange={(value) =>
                    this.setState({
                      birthDate: moment(new Date(value)).format(
                        "iYYYY/iMM/iDD"
                      ),
                    })
                  }
                  locale="ar"
                  calendar="arabic"
                />
              </Form.Item>
            </Col>{" "}
            <Col
              md={{ span: 24 }}
              sm={{ span: 24 }}
              xs={{ span: 24 }}
              className="px-2"
            >
              <Form.Item
                name="email"
                label="???????????? ????????????????????"
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "???? ???????? ???????? ???????????? ????????????????????",
                  },
                  {
                    pattern: new RegExp(
                      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    ),
                    message: "???????????? ???????????????????? ?????? ????????",
                  },
                ]}
              >
                <Input
                  type="email"
                  name="email"
                  onChange={this.handleUserInput}
                  value={this.state.email}
                  placeholder=" ???????? ???????????? ????????????????????"
                />
              </Form.Item>
            </Col>{" "}
            <Col span={24} className="px-2">
              <Form.Item
                rules={[
                  {
                    message: "???? ???????? ???????? ??????????????",
                    required: true,
                  },
                ]}
                name="address"
                hasFeedback
                label="??????????????"
              >
                <Input
                  name="address"
                  onChange={this.handleUserInput}
                  value={this.state.address}
                  placeholder="??????????????"
                />
              </Form.Item>
            </Col>
            <Col span={14}>
              <Form.Item
                name="IdImage"
                label="???????? ????????????"
                rules={[
                  {
                    message: "???? ???????? ???? ???????????? ???????? ????????????",
                    required: this.state.IdImage === null ? true : false,
                  },
                ]}
              >
                <Button block className="ant-uploaded">
                  ?????????? <CloudUploadOutlined />
                  <input
                    className="custom-file-input"
                    onChange={this.setFile}
                    type="file"
                    // style={{ display: 'none' }}
                  />
                </Button>
                {this.state.imageError !== "" ? (
                  <p className="uploadIdSucc pt-2" style={{ color: "#ff4d4f" }}>
                    {this.state.imageError}
                  </p>
                ) : null}{" "}
                {this.state.imageConfirm !== "" ? (
                  <p className="uploadIdSucc pt-2" style={{ color: "#364464" }}>
                    {this.state.imageConfirm}
                  </p>
                ) : null}
              </Form.Item>
            </Col>{" "}
            <Col span={6} className="mr-lg-3 m-auto">
              {this.state.IdImage !== null ? (
                <div className="idImage">
                  <Tooltip placement="topLeft" title="???????????? ????????????">
                    <a
                      rel="noreferrer"
                      target="_blank"
                      download={false}
                      href={`${window.filesURL + "/" + this.state.IdImage}`}
                    >
                      <FontAwesomeIcon icon={faEye} className="fa-2x" />
                    </a>
                  </Tooltip>
                  <Tooltip placement="topRight" title="?????? ????????????">
                    <FontAwesomeIcon
                      icon={faTrash}
                      className=" mx-3 fa-2x"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        this.setState({
                          IdImage: null,
                          imageError: "???? ???????? ???? ???????????? ???????? ????????????",
                          imageConfirm: "",
                        })
                      }
                    />{" "}
                  </Tooltip>
                </div>
              ) : null}
            </Col>
          </Row>
          <Button
            type="primary"
            htmlType="submit"
            // onClick={this.editOwner}
            className="nextBtn"
          >
            ??????????
          </Button>
        </Form>
      </Container>
    );
  }
}

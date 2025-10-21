// DynamicForm.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Form,
  FormItem,
  Input,
  DatePicker,
  TextArea,
  Button,
  ObjectPage,
  Bar,
  ObjectPageHeader,
  FlexBox,
  Link,
  ObjectPageTitle,
  Toolbar,
  ToolbarButton,
  ObjectPageSection,
  Breadcrumbs,
  BreadcrumbsItem,
  Label,
  MessageStrip,
  Title,
  ObjectStatus,
  FormGroup,
  DynamicPageHeader,
  Slider,
  SuggestionItem,
  Dialog,
  List,
  ListItemStandard,
  Icon,
  CheckBox,
  Menu,
  MenuItem,
  MenuSeparator,
  BusyIndicator,
} from "@ui5/webcomponents-react";
import { FormConfigContext } from "../../Components/Context/FormConfigContext";

import { SalesOrderRenderInput } from "./SalesOrderRenderInput";
import General from "./General/General";
import Contents from "./Contents/Contents";
import Logistics from "./Logistics/Logistics";
import { useNavigate, useParams } from "react-router-dom";
import CustomerSelection from "./Header/CustomerSelection";
import Accounting from "./Accounting/Accounting";
import Attachments from "./Attachments/Attachments";
import UserDefinedFields from "./User-DefinedFields/UserDefinedFields";
import { useDispatch, useSelector } from "react-redux";
import {
  createCustomerOrder,
} from "../../store/slices/CustomerOrderSlice";

export default function SalesOrder() {
  const { fieldConfig, CustomerDetails, DocumentDetails } =
    useContext(FormConfigContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderItems } = useSelector((state) => state.orderItems);
  const [apiError, setApiError] = useState(null);
  const { formId } = useParams();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [tabList, setTabList] = useState([]);
  const [formDetails, setFormDetails] = useState([]);
  const [formData, setFormData] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [open, setOpen] = useState(false);
  const [type,setType]= useState("Item")
  const [itemTabledata, setitemTableData] = useState([
    { slno: 1, ItemCode: "", ItemName: "", quantity: "", amount: "" },
  ]);
  const [itemdata, setitemData] = useState([
    { slno: 1, ItemCode: "", ItemName: "", quantity: "", amount: "" },
  ]);
  const [serviceTabledata, setserviceTableData] = useState([
    { slno: 1, ServiceCode: "", ServiceName: "", quantity: "", amount: "" },
  ]);
  const [servicedata, setserviceData] = useState([
    { slno: 1, ServiceCode: "", ServiceName: "", quantity: "", amount: "" },
  ]);
  const [form, setForm] = useState({
    CardCode: "",
    CardName: "",
    RefNo: "",
    DocNo: "",
    DocDate: "",
    Remarks: "",
    DocTotal: 0,
    items: [{ ItemCode: "", ItemName: "", Quantity: 0, Price: 0 }],
    cusDetail: [],
    U_Test1: "",
    U_Test2: "",
  });


  const handleChange = (e, name, formName) => {
    const newValue = e.target.value;
    if (formName === "cusDetail" || formName === "docDetail") {
      setForm((prevForm) => ({
        ...prevForm,
        formName: [{ [name]: newValue }],
      }));
      return;
    } else {
      setForm({ ...form, [name]: newValue });
    }

    // If the field is part of the "additional" section

    // Top-level fields
  };

  const handleRowChange = (i, name, key, value) => {
    //const key = tab === "Items" ? "items" : "additional";
    const newRows = [...form[key]];
    newRows[i][name] = value;
    setForm({ ...form, [key]: newRows });
  };

  const addRow = (key) => {
    //const key = tab === "Items" ? "items" : "additional";
    const newRow = { ItemCode: "", ItemName: "", Quantity: 0, Price: 0 };
    setForm({ ...form, [key]: [...form[key], newRow] });
  };

  const deleteRow = (i, key) => {
    //const key = tab === "Items" ? "items" : "additional";
    const newRows = form[key].filter((_, idx) => idx !== i);
    setForm({ ...form, [key]: newRows });
  };
  const handleSubmit = async (form) => {
    console.log(
      "Form submitted:",
      
      rowSelection,
      itemTabledata,
      serviceTabledata,
      itemdata
    );
    const filteredData = itemdata.filter((item) =>
      itemTabledata.some(
        (tableItem) =>
          tableItem.ItemCode === item.ItemCode &&
          tableItem.ItemName === item.ItemName
      )
    );
    let payload={}
    try {
      setLoading(true);
      if(type==="Item"){
        payload = {
        CardCode: formData.CardCode,
        DocDueDate: formData.DocDueDate
          ? new Date(formData.DocDueDate)
              .toISOString()
              .split("T")[0]
              .replace(/-/g, "")
          : new Date().toISOString().split("T")[0].replace(/-/g, ""),
        DocumentLines: Object.values(itemTabledata).map((line) => ({
          ItemCode: line.ItemCode,
          ItemDescription: line.ItemName, // ✅ rename to ItemDescription
          Quantity: line.quantity,
          UnitPrice: line.amount,
        })),
      };
      }else{
        payload = {
        CardCode: formData.CardCode,
        DocType: "dDocument_Service",
        DocDueDate: formData.DocDueDate
          ? new Date(formData.DocDueDate)
              .toISOString()
              .split("T")[0]
              .replace(/-/g, "")
          : new Date().toISOString().split("T")[0].replace(/-/g, ""),
        DocumentLines: Object.values(serviceTabledata).map((line) => ({
          AccountCode: line.ServiceCode,
          ItemDescription: line.ServiceName, // ✅ rename to ItemDescription        
          
          UnitPrice: line.amount,
        })),
      };
      }
      

      console.log("payload", payload);
      const res = await dispatch(createCustomerOrder(payload)).unwrap();
      if (res.message === "Please Login!") {
        navigate("/login");
      }
      setOpen(true);
    } catch (err) {
      setApiError(err?.message || "Failed to create branch");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setOpen(true); // open success dialog
      }, 2000); // ✅ stop loader
    }
  };
  const renderInput = (field) => {
    const value = form[field.FieldName] || "";

    switch (field.inputType) {
      case "text":
      case "number":
        return (
          <Input
            type={field.inputType}
            value={value}
            onInput={(e) => handleChange(e, field.FieldName)}
          />
        );
      case "date":
        return (
          <DatePicker
            value={value}
            onChange={(e) => handleChange(e, field.FieldName)}
          />
        );
      case "checkbox":
        return (
          <CheckBox
            onChange={(e) => handleChange(e, field.FieldName)}
            text="CheckBox"
            valueState="None"
          />
        );
      case "textarea":
        return (
          <TextArea
            value={value}
            onInput={(e) => handleChange(e, field.FieldName)}
          />
        );
      default:
        return null;
    }
  };
  useEffect(() => {
    if (formId) {
      // Fetch form data based on formId
      const formDetails = user?.Roles?.flatMap((role) =>
        role.UserMenus.flatMap((menu) =>
          menu.children.filter((submenu) => submenu.Form.id === formId)
        )
      );
      setTabList((formDetails && formDetails[0]?.Form.FormTabs) || []);
      setFormDetails(formDetails);
    } else {
      navigate("/");
    }
  }, [formId]);
  return (
    <>
      {/* <BusyIndicator
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 1000,
                    backgroundColor: "rgba(241, 243, 248, 0.8)",
                  }}
                  active={loading}
                > */}
        <ObjectPage
          footerArea={
            <>
              {" "}
              <Bar
                style={{ padding: 0.5 }}
                design="FloatingFooter"
                endContent={
                  <>
                    <Button design="Positive" onClick={() => handleSubmit()}>
                      Submit
                    </Button>
                    <Button
                      design="Positive"
                      onClick={() => navigate(`/Sales/${formId}`)}
                    >
                      Cancel
                    </Button>
                  </>
                }
              />
            </>
          }
          headerArea={
            <DynamicPageHeader>
              {/* <FlexBox wrap="Wrap">
            <FlexBox direction="Column">
              <Label>Customer</Label>
            </FlexBox>
            <span style={{ width: "4rem" }} />
            <FlexBox direction="Column">
              <Label>Total:</Label>
              <ObjectStatus state="None">GBP 0.00</ObjectStatus>
            </FlexBox>
            <span style={{ width: "4rem" }} />
            <FlexBox direction="Column">
              <Label>Status</Label>
              <ObjectStatus state="Positive">Open</ObjectStatus>
            </FlexBox>
            <span style={{ width: "4rem" }} />
            <FlexBox direction="Column">
              <Label>Credit Limit Utilization</Label>
              <Slider
                min={0}
                max={100}
                step={1}
                //value={value}
                showTickmarks
                showTooltip
              //onInput={handleSliderChange}
              />
            </FlexBox>
          </FlexBox> */}
            </DynamicPageHeader>
          }
          // image="https://sap.github.io/ui5-webcomponents-react/v2/assets/Person-B7wHqdJw.png"
          imageShapeCircle
          mode="IconTabBar"
          onBeforeNavigate={function Xs() {}}
          onPinButtonToggle={function Xs() {}}
          onSelectedSectionChange={function Xs() {}}
          onToggleHeaderArea={function Xs() {}}
          selectedSectionId="section1"
          style={{
            height: "700px",
            maxHeight: "90vh",
          }}
          titleArea={
            <ObjectPageTitle
              breadcrumbs={
                <>
                  <Breadcrumbs
                    design="Standard"
                    separators="Slash"
                    onItemClick={(e) => {
                      const route = e.detail.item.dataset.route;
                      if (route) navigate(route);
                    }}
                  >
                    <BreadcrumbsItem data-route="/UserDashboard">
                      Home
                    </BreadcrumbsItem>
                    <BreadcrumbsItem data-route={`/Sales/${formId}`}>
                      Sales Orders
                    </BreadcrumbsItem>
                    <BreadcrumbsItem>
                      {formDetails ? "Create "+formDetails[0]?.name : "Create Sales Order"}
                    </BreadcrumbsItem>
                  </Breadcrumbs>
                </>
              }
              header={
                <Title level="H2">
                  {formDetails ? formDetails[0]?.name : "Sales Order"}
                </Title>
              }
              navigationBar={
                <Toolbar design="Transparent">
                  {/* <ToolbarButton design="Transparent" icon="full-screen" />
              <ToolbarButton design="Transparent" icon="exit-full-screen" /> */}

                  <ToolbarButton
                    onClick={() => navigate(`/Sales/${formId}`)}
                    design="Transparent"
                    icon="decline"
                  />
                </Toolbar>
              }
            >
              <ObjectStatus>
                {/* <Button design="Transparent" icon="navigation-right-arrow"  onClick={openMenu} >
                 Company
              </Button>
            <CustomerSelection menuRef={menuRef}/> */}
              </ObjectStatus>
            </ObjectPageTitle>
          }
        >
          {/* {
      tabList.length > 0 && tabList.map((tab) => {
        console.log("object", tab);
        if (tab.name === "general") {
          return ( */}
          <ObjectPageSection
            id="section1"
            style={{ height: "100%" }}
            titleText="General"
          >
            {/* <General form={form} SubForms={tab.SubForms} handleChange={handleChange} /> */}
            <General
              onSubmit={handleSubmit}
              setFormData={setFormData}
              formData={formData}
              defaultValues={{
                CardCode: "",
                DocDueDate: "1",
                DocumentLines: [],
              }}
              apiError={apiError}
            />
          </ObjectPageSection>
          {/* );
        } else if (tab.name === "contents") {
          return ( */}
          <ObjectPageSection
            id="section2"
            style={{
              height: "100%",
            }}
            titleText="Contents"
          >
            <Contents
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
              itemdata={itemdata}
              setitemData={setitemData}
              setitemTableData={setitemTableData}
              itemTabledata={itemTabledata}
               servicedata={servicedata}
              setserviceData={setserviceData}
              setserviceTableData={setserviceTableData}
              serviceTabledata={serviceTabledata}
              orderItems={orderItems}
              loading={loading}
              form={form}
              handleRowChange={handleRowChange}
              deleteRow={deleteRow}
              addRow={addRow}
              SalesOrderRenderInput={SalesOrderRenderInput}
              handleChange={handleChange}
              type={type}
              setType={setType}
              mode={"create"}
            />
          </ObjectPageSection>
          {/* );
        } else if (tab.name === "logistics") {
          return ( */}
          <ObjectPageSection
            id="section3"
            style={{
              height: "100%",
            }}
            titleText="Logistics"
          >
            <Logistics
              fieldConfig={fieldConfig}
              SalesOrderRenderInput={SalesOrderRenderInput}
              form={form}
              handleChange={handleChange}
            />
          </ObjectPageSection>
          {/* );
        }
        else if (tab.name === "accounting") {
          return ( */}
          <ObjectPageSection
            id="section4"
            style={{
              height: "100%",
            }}
            titleText="Accounting"
          >
            <Accounting />
          </ObjectPageSection>
          {/* );
        } else if (tab.name === "attachments") {
          return ( */}
          <ObjectPageSection
            id="section5"
            style={{
              height: "100%",
            }}
            titleText="Attachments"
          >
            <Attachments />
          </ObjectPageSection>
          {/* );
        } else if (tab.name === "user-defined-field") {
          return ( */}
          <ObjectPageSection
            id="section6"
            style={{
              height: "100%",
            }}
            titleText="User-defined Fields"
          >
            <UserDefinedFields form={form} handleChange={handleChange} />
          </ObjectPageSection>
          {/* );
        }
      }) */}
        </ObjectPage>
     {/* </BusyIndicator> */}
      <Dialog open={open} onAfterClose={() => setOpen(false)}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "2rem",
            textAlign: "center",
          }}
        >
         
          {apiError ? (
            <><Icon
              name="message-error"
              style={{ fontSize: "2rem", color: "red" }}
            ></Icon>
              <h2 style={{ marginTop: "1rem" }}>Error!</h2>
              <p>{apiError}</p>
            </>
          ) : (
             <><Icon name="message-success" style={{ fontSize: "2rem", color: "green" }} ></Icon>
              <h2 style={{ marginTop: "1rem" }}>Success!</h2>
              <p>Your request has been submitted successfully 🎉</p>
            </>
          )}
          <Button
            design="Emphasized"
            onClick={() => {
              navigate(`/Sales/${formId}`);
              setOpen(false);
            }}
          >
            OK
          </Button>
        </div>
      </Dialog>
    </>
  );
}

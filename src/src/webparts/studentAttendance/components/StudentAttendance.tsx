import * as React from 'react';
import styles from './StudentAttendance.module.scss';
import type { IStudentAttendanceProps } from './IStudentAttendanceProps';
import { SPComponentLoader } from '@microsoft/sp-loader';
import "@pnp/polyfill-ie11";
import "@pnp/sp/webs";
import { SPFI } from "@pnp/sp";
import "@pnp/sp/lists";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import "@pnp/sp/fields";
import '@pnp/sp/site-users';
import { getSP } from "./pnpjsConfig";
import Clock from 'react-live-clock';

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "bootstrap/dist/css/bootstrap.css";
import { HttpClient, HttpClientResponse } from "@microsoft/sp-http";
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
const daysOfWeek = [
  {
    "english": "Sunday",
    "arabic": "الأحد"
  },
  {
    "english": "Monday",
    "arabic": "الاثنين"
  },
  {
    "english": "Tuesday",
    "arabic": "الثلاثاء"
  },
  {
    "english": "Wednesday",
    "arabic": "الأربعاء"
  },
  {
    "english": "Thursday",
    "arabic": "الخميس"
  },
  {
    "english": "Friday",
    "arabic": "الجمعة"
  },
  {
    "english": "Saturday",
    "arabic": "السبت"
  }
];





export default class StudentAttendance extends React.Component<IStudentAttendanceProps, any> {
  private _sp: SPFI;
  constructor(props: IStudentAttendanceProps) {
    super(props);
    this.state = {
      items: [],
      time_ind: "",
      time_out: "",
      timer_value: 0,
      curent_user_email: "",
      curent_user_name: "",
      Out_btn_Css: "btn_not_in_Css",
      Curent_User_Todays_ID: "",
      wpcontext: this.props.wpcontext,
      hostname: "",
      hostip: "",
      check_in_Time: "",
      showEarlyOutPop: 0,
      earlyoutdesc: "",
      CurrentSQLItemId: 0,
      ChcekTimeOut: "",
      userDisplayName: "",
      isEmployee: 0,
      AllowedIP: "",
      IsManagementUser: "No",
      notes: "",
      CurrentSubject: "",
      CurrentDay: "",
      CurrentTecher: "",
      CurrentTimeSlot: "",
      CurrentTimeCondition: 0,
      CurentFcialTimeIn: "",
      CurrentFacialTimeOut: "",
      Restricted: true, //ip
      loader: 0,
      CurrentTecherKey: "",
      IsAlreadyCheckInd: false,
      AlreadyCheckInTime: "",
      currentClassroom: "",
      CurrentProgram: "لأستطيع",
      popupshow: false,
      CurrentCheckintime: "",
      CurrentDayAr: "",
      CurrentStudentName: "",
      TimeTableArray: [],
      TeachersArray: []

    }
    this._sp = getSP();
    this.timeout = this.timeout.bind(this);
    this.timeint = this.timeint.bind(this);
    this.onchangenotes = this.onchangenotes.bind(this);
    this.GetTeacherScheul = this.GetTeacherScheul.bind(this);
    this.closemodal = this.closemodal.bind(this);

    SPComponentLoader.loadCss("https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css");
  }
  GetTeacherScheul = (event: any, option: any, index: any) => {
    const Teacher = option.key;
    const d = new Date();
    let hours = d.getHours(); // => 9
    const minutes = d.getMinutes(); // =>  30
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    var xhour = "";
    if (hours < 10)
      var xhour = '0' + hours;
    else
      xhour = hours.toString();

    var xminutes = minutes < 10 ? '0' + minutes : minutes;
    var CurrentTime = xhour + ":" + xminutes;
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const dayName = days[new Date().getDay()];
    //var FinalItem = Classtype.filter(user => user.Teacher == Teacher && user.Day == dayName);
    const FinalItem = this.state.TimeTableArray.filter((user: { Teacherkey: any; Day: any; }) => user.Teacherkey === Teacher && user.Day === dayName);//&& user.TimeSlot == XTime);


    const CurrentdateFormat = Date.parse("2013/05/29 " + CurrentTime + " " + ampm);
    let TimeInCondition = false;

    let TempSubject = "";
    let TempTeacher = "";
    let TempDay = "";
    let TempSlot = "";

    let TempFacialTimeIn = "";
    let TempFcailTimeout = "";
    let TempTecherKey = "";
    let TempcurrentClassroom = "";
    let Temparday = "";

    for (var x = 0; x < FinalItem.length; x++) {
      const TimeIncheck = FinalItem[x].Time;

      let ampmx = "am";
      let ampmxmax = "am";
      if (TimeIncheck.split(':')[0] === "12" || TimeIncheck.split(':')[0] === "02" || TimeIncheck.split(':')[0] === "03" || TimeIncheck.split(':')[0] === "01" || TimeIncheck.split(':')[0] === "04" || TimeIncheck.split(':')[0] === "05") {
        ampmx = "pm";
      }

      const TimeIncheckMax = FinalItem[x].TimeMax;
      if (TimeIncheckMax.split(':')[0] === "12" || TimeIncheckMax.split(':')[0] === "02" || TimeIncheckMax.split(':')[0] === "03" || TimeIncheckMax.split(':')[0] === "01" || TimeIncheckMax.split(':')[0] == "04" || TimeIncheckMax.split(':')[0] == "05") {
        ampmxmax = "pm";
      }

      // var CurrentdateFormattimeIn = new Date(Date.parse("2013/05/29 " + TimeIncheck + " " + ampm));
      const CurrentdateFormattimeIn = Date.parse("2013/05/29 " + TimeIncheck + " " + ampmx);

      //var CurrentdateFormattimeMax = new Date(Date.parse("2013/05/29 " + TimeIncheckMax + " " + ampm));
      const CurrentdateFormattimeMax = Date.parse("2013/05/29 " + TimeIncheckMax + " " + ampmxmax);

      if (CurrentdateFormat >= CurrentdateFormattimeIn && CurrentdateFormat <= CurrentdateFormattimeMax) {
        //CurrentdateFormat <= CurrentdateFormattimeMax
        TimeInCondition = true;
        // alert(true);
        TempSubject = FinalItem[x].Subject;
        TempTeacher = option.text;
        TempDay = dayName
        TempSlot = FinalItem[x].Time + ":" + FinalItem[x].TimeMax
        TempFacialTimeIn = FinalItem[x].Time;
        TempFcailTimeout = FinalItem[x].TimeMax;
        TempTecherKey = FinalItem[x].Teacherkey;
        TempcurrentClassroom = FinalItem[x].ClassRoom;

        const aTemparday = daysOfWeek.filter(user => user.english == dayName);
        Temparday = aTemparday[0].arabic;

      }




    }
    this.setState(
      {
        CurrentTimeCondition: TimeInCondition,
        CurrentSubject: TempSubject,
        CurrentDay: TempDay,
        CurrentTecher: TempTeacher,
        CurrentTimeSlot: TempSlot,
        CurentFcialTimeIn: TempFacialTimeIn,
        CurrentFacialTimeOut: TempFcailTimeout,
        CurrentTecherKey: TempTecherKey,
        currentClassroom: TempcurrentClassroom,
        CurrentDayAr: Temparday,

      });
    //alert(TimeInCondition);
    return "";




  }
  closemodal() {
    this.setState(
      {
        popupshow: 1,

      });
    window.open('https://nacdeduae.sharepoint.com', '_blank');
  }

  onchangenotes(event: any) {


    this.setState(
      {
        notes: event.target.value,

      });
  }
  async timeint() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const date = today.getDate();
    const currentDate = month + "/" + date + "/" + year;
    const currTime = new Date().toLocaleString();
    const finalcurtime = currTime.split(',')[1];


    await this._sp.web.lists.getByTitle("Students attendance").items.add({
      Title: this.state.userDisplayName,
      Email: this.state.curent_user_email,
      TimeIn: finalcurtime,
      Timeout: "Not Done",
      Classroom: this.state.currentClassroom,
      Subject: this.state.CurrentSubject,
      Notes: currentDate,
      Day: this.state.CurrentDay,
      Room: "1",
      Teacher: this.state.CurrentTecher,
      DisplayName: this.state.CurrentStudentName,
      Time_In_Date: currentDate,
      FacialTimeIn: this.state.CurentFcialTimeIn,
      FacialTimeOut: this.state.CurrentFacialTimeOut,
      TimeSlot: this.state.CurentFcialTimeIn + "-" + this.state.CurrentFacialTimeOut,
      teacherkey: this.state.CurrentTecherKey,
      Program: this.state.CurrentProgram,
      Status: this.IsStudentLate(this.state.CurentFcialTimeIn),
    }).then((response) => {
      const currTime = new Date().toLocaleString();
      const finalcurtime = currTime.split(',')[1];
      this.setState(
        {
          CurrentCheckintime: finalcurtime,
          popupshow: 1,

        });

    });

  }

  IsStudentLate(facialTimeine: any) {
    var ampmx = "am";
    //var ampmxmax = "am";
    if (facialTimeine.split(':')[0] === "12" || facialTimeine.split(':')[0] === "02" || facialTimeine.split(':')[0] === "03" || facialTimeine.split(':')[0] === "01" ||
      facialTimeine.split(':')[0] === "04" || facialTimeine.split(':')[0] === "05"

    ) {
      ampmx = "pm";
    }



    var currentDatec = new Date();
    var year = currentDatec.getFullYear();
    var month = currentDatec.getMonth() + 1; // Note: January is 0, so we add 1 to get the correct 
    var day = currentDatec.getDate();
    var CurrentdateFormattimeIn = Date.parse(year + "/" + month + "/" + day + " " + facialTimeine + " " + ampmx);
    var currentDate = new Date(); // Current date and time

    var differenceMs = Math.abs(currentDate.getTime() - CurrentdateFormattimeIn);
    var differenceMinutes = Math.ceil(differenceMs / (1000 * 60));
    var strdifferenceMinutes = "Present";
    if (differenceMinutes > 16) {
      strdifferenceMinutes = "Late";
    }
    return strdifferenceMinutes;
  }

  async IpGetInformation() {
    return this.props.wpcontext.httpClient
      .get(
        'https://api.ipify.org?format=json',
        HttpClient.configurations.v1
      )
      .then((res: HttpClientResponse): Promise<any> => {
        return res.json();
      })
      .then(async (response: any): Promise<void> => {

        this.setState(
          {
            hostname: window.location.hostname,
            hostip: response.ip,

          });
        await this.getAttendanceMaster();

      });

  }

  async timeout() {
    const currTime = new Date().toLocaleString();
    const finalcurtime = currTime.split(',')[1]
    const list = this._sp.web.lists.getByTitle("Time Attendance");
    await list.items.getById(this.state.Curent_User_Todays_ID).update({
      Time_x0020_Out: finalcurtime,
      TimeOut_x0020_Type: "User"
    });
    window.open('https://nacdeduae.sharepoint.com/');
  }

  async componentDidMount() {
    this.setState({ loader: 1 });
    await this.getuserprofile().catch();
    //  this.FeedTimeTab();
   await this.getTimeTable().then(async res => {
      // res here is myVar
      await this.GetTeachers().catch();
    }).catch();




  }

  private async GetTeachers() {

    const tempitem: any[] = [];
    // const allItems: any[] = await this._sp.web.lists.getByTitle("Teachers").items();
   await this._sp.web.lists.getByTitle("Teachers").items().then(async (items: any[]) => {
      for (var x = 0; x < items.length; x++) {
        var obj = {
          'TeacherKey': items[x].TeacherKey,
          'Title': items[x].Title,
          'STatus': items[x].STatus,
          'key': items[x].TeacherKey,
          'text': items[x].Title
        }
        tempitem.push(obj);
      }
      await this.IpGetInformation().catch();
      this.setState({
        loader: 0,
        TeachersArray: tempitem,
      });

      console.log(items);
    });



  }

  private async getTimeTable() {

    const tempitem: any[] = [];
    // const allItems: any[] = await this._sp.web.lists.getByTitle("Time Table").items();
    await this._sp.web.lists.getByTitle("Time Table").items().then(async (allItems: any[]) => {
      for (var x = 0; x < allItems.length; x++) {
        var obj = {
          'Teacher': allItems[x].Teacher,
          'Day': allItems[x].Day,
          'Subject': allItems[x].Subject,
          'TimeStart': allItems[x].TimeStart,
          'TimeMax': allItems[x].TimeMax,
          'TimeSlot': allItems[x].TimeSlot,
          'ClassRoom': allItems[x].ClassRoom,
          'Teacherkey': allItems[x].Techerkey,
          'IsRamdan': allItems[x].IsRamdan,
          'Course': allItems[x].Course,
          'Time': allItems[x].TimeStart,
        }
        tempitem.push(obj);
      }


      this.setState({
        loader: 0,
        TimeTableArray: tempitem,
      });

    });




  }

  getTeacherFinalNAme(teacherkey: any) {
    var teachernamearabic = "";
    switch (teacherkey) {
      case "badria":
        teachernamearabic = "بدرية الحوسني";
        break;

      case "asmahan":
        teachernamearabic = "أسمهان المنذري"
        break;


      case "afaf":
        teachernamearabic = "عفاف المنهلي";
        break;


      case "bilqis":
        teachernamearabic = "بلقيس الحميري";
        break;

    }
    return teachernamearabic;

  }

  async FeedTimeTab() {
    /*
        for (let i = 0; i < Classtype.length; i++) {
    
          await this._sp.web.lists.getByTitle("Time Table").items.add({
            Title: this.getTeacherFinalNAme(Classtype[i].Teacher),
            Teacher: this.getTeacherFinalNAme(Classtype[i].Teacher),
            Day: Classtype[i].Day,
            Subject: Classtype[i].Subject,
            TimeStart: Classtype[i].Time,
            TimeMax: Classtype[i].TimeMax,
            TimeSlot: Classtype[i].TimeSLot,
            ClassRoom: Classtype[i].ClassRoom,
            Techerkey: Classtype[i].Teacher,
            IsRamdan: "No",
            Course: "لأستطيع",
    
          }).then((response) => {
    
          });
    
    
        }
        */
  }

  private async getAttendanceMaster() {

    // const items: any[] = await this._sp.web.lists.getByTitle("").items();
    var TmpResTrictred = true;
    await this._sp.web.lists.getByTitle("Time Attendance Master").items().then(async (items: any[]) => {
      if (this.state.hostip === items[0].IP) {
        TmpResTrictred = false;
      }
      this.setState({ Restricted: TmpResTrictred, loader: 0 });
      if (TmpResTrictred === false) {
       await this.IsUserAlreadyCheckIn().catch();
      }


      // 

    });

  }

  async IsUserAlreadyCheckIn() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const date = today.getDate();
    const currentDate = month + "/" + date + "/" + year;

    //const currTime = new Date().toLocaleString();
    //const finalcurtime = currTime.split(',')[1];
    var TempIsAlreadyCheckInd = false;
    //  var TempTime = finalcurtime.replace('PM', '').trim();
    //TempTime = TempTime.replace('AM', '').trim();

    var TempAlreadyCheckInTime = "";
    const tempitem: any[] = [];
    await this._sp.web.lists.getByTitle("Students attendance").items.select(
      "Title", "Email", "ID", "TimeIn", "TimeIn", "Classroom", "Subject",
      "Notes", "Day", "Room", "Teacher", "DisplayName", "Time_In_Date", "TimeSlot", "teacherkey", "FacialTimeIn", "FacialTimeOut")
      .filter("Email eq '" + this.state.curent_user_email + "' and Time_In_Date eq '" + currentDate + "'")().then(items => {
        items.forEach(data => {
          const objs = {
            'Email': data.Email,
            'TimeSlot': data.TimeSlot,
            'Day': data.Day,
            'Teacher': data.Teacher,
            'Id': data.Id,
            'TimeIn': data.TimeIn,
            'teacherkey': data.teacherkey,
            'FacialTimeIn': data.FacialTimeIn,
            'FacialTimeOut': data.FacialTimeOut,

          };
          tempitem.push(objs);
          //var XTime = data.TimeSlot.toString();

          var spdataTimeIn = this.Getampm(data.FacialTimeIn);
          var spdataTimeMax = this.Getampm(data.FacialTimeOut);

          // var FinalItem = Classtype.filter(user => user.Teacher == data.teacherkey && user.Day == data.Day);;//&& user.TimeSlot == XTime);
          const arrayx = this.state.TimeTableArray;
          var FinalItem = arrayx.filter((user: { Teacherkey: any; Day: any; }) => user.Teacherkey === data.teacherkey && user.Day === data.Day);//&& user.TimeSlot == XTime);

          for (var g = 0; g < FinalItem.length; g++) {

            var dataTimeIn = this.Getampm(FinalItem[g].Time);
            var dataTimeMax = this.Getampm(FinalItem[g].TimeMax);
            if (dataTimeIn === spdataTimeIn && spdataTimeMax <= dataTimeMax) {

              TempIsAlreadyCheckInd = true;
              TempAlreadyCheckInTime = data.TimeIn;


            }
          }


        });





        this.setState({
          loader: 0,
          items: tempitem,
          IsAlreadyCheckInd: TempIsAlreadyCheckInd,
          AlreadyCheckInTime: TempAlreadyCheckInTime
        });

      });

  }

  Getampm(stringdt: any) {
    var ampmx = "am";
    if (stringdt.split(':')[0] === "12" || stringdt.split(':')[0] === "02" || stringdt.split(':')[0] === "03" || stringdt.split(':')[0] === "01" || stringdt.split(':')[0] === "04" || stringdt.split(':')[0] === "05") {
      ampmx = "pm";
    }
    var expectedate = Date.parse("2013/05/29 " + stringdt + " " + ampmx);
    return expectedate;

  }

  async getuserprofile(): Promise<void> {
    const user = await this._sp.web.currentUser();
    this.setState(
      {
        curent_user_email: user.Email.toLowerCase(),
        userDisplayName: user.Title,
        CurrentStudentName: user.Title

      });
  }



  public render(): React.ReactElement<IStudentAttendanceProps> {




    const optionsdteac: IDropdownOption[] = this.state.TeachersArray;

    return (
      <section className='AttendanceSectionClasss'>

        {
          this.state.Restricted === false &&

          <div className={styles.welcome}>
            <div className="ms-Grid-row" dir="ltr">
              <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12" >
                <div className="headindiv">تسجيل الحضور للمحاضرات</div>
              </div>
              <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg3 "></div>
            </div>

            <div className="ms-Grid-row">
              <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg3 ">
                <div className="headingdivc">

                  البرنامج : لأستطيع
                </div>

              </div>
              <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg3 labelclass">
                <span className="labelclass"></span>
              </div>

              <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg3 dropdownclass">
                <Dropdown
                  placeholder=":اسم المحاضر "
                  options={optionsdteac}
                  onChange={this.GetTeacherScheul}
                />
              </div>


              <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg3 "></div>

            </div>
            <div className="ms-Grid-row">

              <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 " >
                {
                  this.state.ChcekTimeOut === "0" &&
                  <div className={styles.btn_not_in_Css} onClick={this.timeint.bind(this)} >In </div>
                }

              </div>
            </div>



            {
              this.state.Restricted === false &&

              <>

                {
                  this.state.CurrentTimeCondition === true &&
                  <>
                    <div className="ms-Grid-row">
                      <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg1"></div>
                      <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg2 columnsClass">
                        <span>اليوم</span>
                      </div>


                      <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg1 columnsClass">
                        <span>الشعبة</span>
                      </div>

                      <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg2 columnsClass">
                        <span>زمن المحاضرة</span>
                      </div>


                      <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg2 columnsClass">
                        <span>المادة</span>
                      </div>


                      <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg2 columnsClass">
                        <span>إسم المحاضر</span>
                      </div>
                      <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg1"></div>


                    </div>


                    <div className="ms-Grid-row">

                      <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg1"></div>

                      <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg2 columnsgrid">
                        {this.state.CurrentDayAr}
                      </div>


                      <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg1 columnsgrid">
                        {this.state.currentClassroom}
                      </div>
                      <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg2 columnsgrid">
                        {this.state.CurrentTimeSlot}
                      </div>

                      <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg2 columnsgrid">
                        {this.state.CurrentSubject}
                      </div>
                      <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg2 columnsgrid">
                        {this.state.CurrentTecher}
                      </div>
                      <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg1"></div>


                    </div>
                    <div className="ms-Grid-row">
                      <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4"></div>
                      <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4">
                        <div className={styles.clockdiv}>
                          {this.state.CurrentDayAr} : <Clock format={'HH:mm:ss'} ticking={true} timezone={'Asia/Muscat'} />
                        </div>

                      </div>
                      <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4"></div>

                    </div>
                    <div className="ms-Grid-row" dir="ltr">
                      <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4"></div>

                      <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4">
                        <div className={styles.btnbtn_css_meetingc} onClick={this.timeint.bind(this)} > سجل حضورك </div>
                      </div>
                      <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4"></div>

                    </div>




                  </>
                }




                <div className="ms-Grid-row">

                  <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 " >
                    {
                      this.state.ChcekTimeOut === "x" &&
                      <div className={styles.btnbtn_css_meetingc} onClick={this.timeint.bind(this)} >In </div>
                    }
                  </div>
                </div>



              </>
            }

          </div>
        }



        {
          this.state.loader === 1 &&
          <div className={styles.loaderdiv}>
            <div className={styles.loader}>
            </div>
          </div>
        }

        {

          this.state.Restricted === true &&

          <div className="popupfather">
            <div>
              <div className="ms-Grid-row" dir="ltr">
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4" ></div>
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4" >
                  <img src='https://itservicestorage.blob.core.windows.net/nacdstuff/nacd_restricted.png' />
                </div>
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4" >
                  <h2>{this.state.hostip}</h2>

                </div>

              </div>
            </div>
          </div>

        }
        <hr></hr>




        {
          this.state.popupshow === 1 &&

          <div className="popupfather">
            <div className='popupcontent'>

              <div className="ms-Grid-row" dir="ltr">
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12" >
                  <div className='displaynaecss'>
                    <p>تسجيل-الحضور </p>
                    <span className='namespan'>
                      {
                        this.state.userDisplayName
                      }
                    </span>
                    <img src='https://itservicestorage.blob.core.windows.net/nacdstuff/chckkin.png' width="150px" />
                    <p>تم تسجيل حضورك بنجاح!</p>

                    <p>{this.state.CurrentCheckintime}</p>
                  </div>


                </div>
              </div>


              <div className={styles.btnbtn_css_meetingc} onClick={this.closemodal.bind(this)} > Close </div>
              <hr></hr>
            </div>

          </div>
        }

        {
          this.state.IsAlreadyCheckInd === true &&

          <div className="popupfather">
            <div className='popupcontent'>

              <div className="ms-Grid-row" dir="ltr">
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12" >
                  <div className='displaynaecss'>
                    <p>تسجيل-الحضور </p>
                    <span className='namespan'>
                      {
                        this.state.userDisplayName
                      }
                    </span>
                    <img src='https://itservicestorage.blob.core.windows.net/nacdstuff/chckkin.png' width="150px" />
                    <p>تم تسجيل حضورك بنجاح!</p>

                    <p>{this.state.CurrentCheckintime}</p>
                  </div>


                </div>
              </div>

            </div>

          </div>
        }



      </section>
    );
  }


}


/*
const Classtype = [
  {
    "Teacher": "badria",
    "Day": "Monday",
    "Subject": "تأمل الممارسات",
    "Time": "07:30",
    "TimeMax": "10:00",
    "TimeSLot": "07:30-10:00",
    "ClassRoom": "3",
  },
  {
    "Teacher": "asmahan",
    "Day": "Monday",
    "Subject": "تأمل الممارسات",
    "Time": "07:30",
    "TimeMax": "10:00",
    "TimeSLot": "07:30-10:00",
    "ClassRoom": "2",
  },
  {
    "Teacher": "afaf",
    "Day": "Monday",
    "Subject": "تأمل الممارسات",
    "Time": "07:30",
    "TimeMax": "10:00",
    "TimeSLot": "07:30-10:00",
    "ClassRoom": "4",
  },
  {
    "Teacher": "bilqis",
    "Day": "Monday",
    "Subject": "تأمل الممارسات",
    "Time": "07:30",
    "TimeMax": "10:00",
    "TimeSLot": "07:30-10:00",
    "ClassRoom": "1",
  },


  {
    "Teacher": "badria",
    "Day": "Monday",
    "Subject": "التدبير المنزلي",
    "Time": "10:30",
    "TimeMax": "01:00",
    "TimeSLot": "10:30-01:00",
    "ClassRoom": "1",
  },
  {
    "Teacher": "asmahan",
    "Day": "Monday",
    "Subject": "التدبير المنزلي",
    "Time": "10:30",
    "TimeMax": "01:00",
    "TimeSLot": "10:30-01:00",
    "ClassRoom": "3",
  },
  {
    "Teacher": "afaf",
    "Day": "Monday",
    "Subject": "التدبير المنزلي",
    "Time": "10:30",
    "TimeMax": "01:00",
    "TimeSLot": "10:30-01:00",
    "ClassRoom": "2",
  },
  {
    "Teacher": "bilqis",
    "Day": "Monday",
    "Subject": "التدبير المنزلي",
    "Time": "10:30",
    "TimeMax": "01:00",
    "TimeSLot": "10:30-01:00",
    "ClassRoom": "4",
  },


  {
    "Teacher": "badria",
    "Day": "Monday",
    "Subject": "التدريب العملي لتنمية الطفل",
    "TimeSLot": "02:00-03:30",
    "Time": "02:00",
    "TimeMax": "03:30",
    "ClassRoom": "2",
  },
  {
    "Teacher": "asmahan",
    "Day": "Monday",
    "Subject": "التدريب العملي لتنمية الطفل",
    "TimeSLot": "02:00-03:30",
    "Time": "02:00",
    "TimeMax": "03:30",
    "ClassRoom": "1",
  },
  {
    "Teacher": "afaf",
    "Day": "Monday",
    "Subject": "التدريب العملي لتنمية الطفل",
    "TimeSLot": "02:00-03:30",
    "Time": "02:00",
    "TimeMax": "03:30",
    "ClassRoom": "4",
  },
  {
    "Teacher": "bilqis",
    "Day": "Monday",
    "Subject": "التدريب العملي لتنمية الطفل",
    "TimeSLot": "02:00-03:30",
    "Time": "02:00",
    "TimeMax": "03:30",
    "ClassRoom": "3",
  },

  {
    "Teacher": "badria",
    "Day": "Tuesday",
    "Subject": "وقت إختياري",
    "TimeSlot": "02:00-03:30",
    "Time": "02:00",
    "TimeMax": "03:30",
    "ClassRoom": "-",
  },
  {
    "Teacher": "asmahan",
    "Day": "Tuesday",
    "Subject": "وقت إختياري",
    "TimeSlot": "02:00-03:30",
    "Time": "02:00",
    "TimeMax": "03:30",
    "ClassRoom": "-",
  },
  {
    "Teacher": "afaf",
    "Day": "Tuesday",
    "Subject": "وقت إختياري",
    "TimeSlot": "02:00-03:30",
    "Time": "02:00",
    "TimeMax": "03:30",
    "ClassRoom": "-",
  },
  {
    "Teacher": "bilqis",
    "Day": "Tuesday",
    "Subject": "وقت إختياري",
    "TimeSlot": "02:00-03:30",
    "Time": "02:00",
    "TimeMax": "03:3",
    "ClassRoom": "-",


  }
  ,

  {
    "Teacher": "badria",
    "Day": "Tuesday",
    "Subject": "السلوكيات المهنية في العمل",
    "Time": "10:30",
    "TimeMax": "01:00",
    "TimeSlot": "10:30-01:00",
    "ClassRoom": "2",
  },
  {
    "Teacher": "asmahan",
    "Day": "Tuesday",
    "Subject": "السلوكيات المهنية في العمل",
    "Time": "10:30",
    "TimeMax": "01:00",
    "TimeSlot": "10:30-01:00",
    "ClassRoom": "4",
  },
  {
    "Teacher": "afaf",
    "Day": "Tuesday",
    "Subject": "السلوكيات المهنية في العمل",
    "Time": "10:30",
    "TimeMax": "01:00",
    "TimeSlot": "10:30-01:00",
    "ClassRoom": "1",
  },
  {
    "Teacher": "bilqis",
    "Day": "Tuesday",
    "Subject": "السلوكيات المهنية في العمل",
    "Time": "10:30",
    "TimeMax": "01:00",
    "TimeSlot": "10:30-01:00",
    "ClassRoom": "3",
  },

  {
    "Teacher": "badria",
    "Day": "Tuesday",
    "Subject": "دعم صحة الطفل ورفاهيته",
    "Time": "07:30",
    "TimeMax": "10:00",
    "TimeSLot": "07:30-10:00",
    "ClassRoom": "4",
  },
  {
    "Teacher": "asmahan",
    "Day": "Tuesday",
    "Subject": "دعم صحة الطفل ورفاهيته",
    "Time": "07:30",
    "TimeMax": "10:00",
    "TimeSLot": "07:30-10:00",
    "ClassRoom": "1",
  },
  {
    "Teacher": "afaf",
    "Day": "Tuesday",
    "Subject": "دعم صحة الطفل ورفاهيته",
    "Time": "07:30",
    "TimeMax": "10:00",
    "TimeSLot": "07:30-10:00",
    "ClassRoom": "3",
  },
  {
    "Teacher": "bilqis",
    "Day": "Tuesday",
    "Subject": "دعم صحة الطفل ورفاهيته",
    "Time": "07:30",
    "TimeMax": "10:00",
    "TimeSLot": "07:30-10:00",
    "ClassRoom": "2",
  },

  {
    "Teacher": "badria",
    "Day": "Wednesday",
    "Subject": "تأمل الممارسات",
    "Time": "07:30",
    "TimeMax": "10:00",
    "TimeSLot": "07:30-10:00",
    "ClassRoom": "3",
  },
  {
    "Teacher": "asmahan",
    "Day": "Wednesday",
    "Subject": "تأمل الممارسات",
    "Time": "07:30",
    "TimeMax": "10:00",
    "TimeSLot": "07:30-10:00",
    "ClassRoom": "2",
  },
  {
    "Teacher": "afaf",
    "Day": "Wednesday",
    "Subject": "تأمل الممارسات",
    "Time": "07:30",
    "TimeMax": "10:00",
    "TimeSLot": "07:30-10:00",
    "ClassRoom": "4",
  },
  {
    "Teacher": "bilqis",
    "Day": "Wednesday",
    "Subject": "تأمل الممارسات",
    "Time": "07:30",
    "TimeMax": "10:00",
    "TimeSLot": "07:30-10:00",
    "ClassRoom": "1",
  },

  {
    "Teacher": "badria",
    "Day": "Wednesday",
    "Subject": "التدبير المنزلي",
    "Time": "10:30",
    "TimeMax": "01:00",
    "TimeSLot": "10:30-01:00",
    "ClassRoom": "1",
  },
  {
    "Teacher": "asmahan",
    "Day": "Wednesday",
    "Subject": "التدبير المنزلي",
    "Time": "10:30",
    "TimeMax": "01:00",
    "TimeSLot": "10:30-01:00",
    "ClassRoom": "3",
  },
  {
    "Teacher": "afaf",
    "Day": "Wednesday",
    "Subject": "التدبير المنزلي",
    "Time": "10:30",
    "TimeMax": "01:00",
    "TimeSLot": "10:30-01:00",
    "ClassRoom": "2",
  },
  {
    "Teacher": "bilqis",
    "Day": "Wednesday",
    "Subject": "التدبير المنزلي",
    "Time": "10:30",
    "TimeMax": "01:00",
    "TimeSLot": "10:30-01:00",
    "ClassRoom": "4",
  },


  {
    "Teacher": "badria",
    "Day": "Wednesday",
    "Subject": "التدريب العملي لتنمية الطفل",
    "TimeSLot": "02:00-03:30",
    "Time": "02:00",
    "TimeMax": "03:30",
    "ClassRoom": "2",
  },
  {
    "Teacher": "asmahan",
    "Day": "Wednesday",
    "Subject": "التدريب العملي لتنمية الطفل",
    "TimeSLot": "02:00-03:30",
    "Time": "02:00",
    "TimeMax": "03:30",
    "ClassRoom": "1",
  },
  {
    "Teacher": "afaf",
    "Day": "Wednesday",
    "Subject": "التدريب العملي لتنمية الطفل",
    "TimeSLot": "02:00-03:30",
    "Time": "02:00",
    "TimeMax": "03:30",
    "ClassRoom": "4",
  },
  {
    "Teacher": "bilqis",
    "Day": "Wednesday",
    "Subject": "التدريب العملي لتنمية الطفل",
    "TimeSLot": "02:00-03:30",
    "Time": "02:00",
    "TimeMax": "03:30",
    "ClassRoom": "3",
  },

  {
    "Teacher": "badria",
    "Day": "Thursday",
    "Subject": "وقت إختياري",
    "TimeSlot": "02:00-03:30",
    "Time": "02:00",
    "TimeMax": "03:30",
    "ClassRoom": "-",
  },
  {
    "Teacher": "asmahan",
    "Day": "Thursday",
    "Subject": "وقت إختياري",
    "TimeSlot": "02:00-03:30",
    "Time": "02:00",
    "TimeMax": "03:30",
    "ClassRoom": "-",
  },
  {
    "Teacher": "afaf",
    "Day": "Thursday",
    "Subject": "وقت إختياري",
    "TimeSlot": "02:00-03:30",
    "Time": "02:00",
    "TimeMax": "03:30",
    "ClassRoom": "-",
  },
  {
    "Teacher": "bilqis",
    "Day": "Thursday",
    "Subject": "وقت إختياري",
    "TimeSlot": "02:00-03:30",
    "Time": "02:00",
    "TimeMax": "03:30",
    "ClassRoom": "-",
  }
  ,

  {
    "Teacher": "badria",
    "Day": "Thursday",
    "Subject": "السلوكيات المهنية في العمل",
    "Time": "10:30",
    "TimeMax": "01:00",
    "TimeSLot": "10:30-01:00",
    "ClassRoom": "2",
  },
  {
    "Teacher": "asmahan",
    "Day": "Thursday",
    "Subject": "السلوكيات المهنية في العمل",
    "Time": "10:30",
    "TimeMax": "01:00",
    "TimeSLot": "10:30-01:00",
    "ClassRoom": "4",
  },
  {
    "Teacher": "afaf",
    "Day": "Thursday",
    "Subject": "السلوكيات المهنية في العمل",
    "Time": "10:30",
    "TimeMax": "01:00",
    "TimeSLot": "10:30-01:00",
    "ClassRoom": "1",
  },
  {
    "Teacher": "bilqis",
    "Day": "Thursday",
    "Subject": "السلوكيات المهنية في العمل",
    "Time": "10:30",
    "TimeMax": "01:00",
    "TimeSLot": "10:30-01:00",
    "ClassRoom": "3",
  },


  {
    "Teacher": "badria",
    "Day": "Thursday",
    "Subject": "دعم صحة الطفل ورفاهيته",
    "Time": "07:30",
    "TimeMax": "10:00",
    "TimeSLot": "07:30-10:00",
    "ClassRoom": "4",
  },
  {
    "Teacher": "asmahan",
    "Day": "Thursday",
    "Subject": "دعم صحة الطفل ورفاهيته",
    "Time": "07:30",
    "TimeMax": "10:00",
    "TimeSLot": "07:30-10:00",
    "ClassRoom": "1",
  },
  {
    "Teacher": "afaf",
    "Day": "Thursday",
    "Subject": "دعم صحة الطفل ورفاهيته",
    "Time": "07:30",
    "TimeMax": "10:00",
    "TimeSLot": "07:30-10:00",
    "ClassRoom": "3",

  },
  {
    "Teacher": "bilqis",
    "Day": "Thursday",
    "Subject": "دعم صحة الطفل ورفاهيته",
    "Time": "07:30",
    "TimeMax": "10:00",
    "TimeSLot": "07:30-10:00",
    "ClassRoom": "2",
  },





  {
    "Teacher": "badria",
    "Day": "Friday",
    "Subject": "التدريب العملي لتنمية الطفل",
    "Time": "07:30",
    "TimeMax": "10:00",
    "TimeSLot": "07:30-10:00",
    "ClassRoom": "2",

  },
  {
    "Teacher": "asmahan",
    "Day": "Friday",
    "Subject": "التدريب العملي لتنمية الطفل",
    "Time": "07:30",
    "TimeMax": "10:00",
    "TimeSLot": "07:30-10:00",
    "ClassRoom": "1",
  },
  {
    "Teacher": "afaf",
    "Day": "Friday",
    "Subject": "التدريب العملي لتنمية الطفل",
    "Time": "07:30",
    "TimeMax": "10:00",
    "TimeSLot": "07:30-10:00",
    "ClassRoom": "4",
  },
  {
    "Teacher": "bilqis",
    "Day": "Friday",
    "Subject": "التدريب العملي لتنمية الطفل",
    "Time": "07:30",
    "TimeMax": "10:00",
    "TimeSLot": "07:30-10:00",
    "ClassRoom": "3",
  },


  {
    "Teacher": "badria",
    "Day": "Friday",
    "Subject": "وقت إختياري",
    "Time": "09:30",
    "TimeMax": "12:00",
    "TimeSLot": "09:30-12:00",
    "ClassRoom": "-",

  },
  {
    "Teacher": "asmahan",
    "Day": "Friday",
    "Subject": "وقت إختياري",
    "Time": "09:30",
    "TimeMax": "12:00",
    "TimeSLot": "09:30-12:00",
    "ClassRoom": "-",
  },
  {
    "Teacher": "afaf",
    "Day": "Friday",
    "Subject": "وقت إختياري",
    "Time": "09:30",
    "TimeMax": "12:00",
    "TimeSLot": "09:30-12:00",
    "ClassRoom": "-",
  },
  {
    "Teacher": "bilqis",
    "Day": "Friday",
    "Subject": "وقت إختياري",
    "Time": "09:30",
    "TimeMax": "12:00",
    "TimeSLot": "09:30-12:00",
    "ClassRoom": "-",
  },


];
*/
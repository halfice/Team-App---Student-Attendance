import * as React from "react";
import styles from "./Wpbatch2025.module.scss";
import { getSP } from "./pnpjsConfig";
import "@pnp/sp/presets/all";
import { SPFI } from "@pnp/sp";
import {
  PrimaryButton,
  Stack,
  Spinner,
  SpinnerSize,
  Dialog,
  DialogType,
  DialogFooter,
} from "office-ui-fabric-react";
import { PageContext } from "@microsoft/sp-page-context";
import { WebPartContext } from "@microsoft/sp-webpart-base";

interface IAttendanceUpdate {
  Status?: string;
  TimeIn?: string;
  Timeout?: string;
}

export interface IWpbatch2025Props {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  pageContext: PageContext;
  wpcontext: WebPartContext;
}

export default class Wpbatch2025 extends React.Component<
  IWpbatch2025Props,
  any
> {
  private _sp: SPFI;

  constructor(props: IWpbatch2025Props) {
    super(props);
    this.state = {
      sections: [],
      students: [],
      attendance: {},
      timetable: {},
      selectedSection: null,
      currentTimeSlotActive: false,
      isLoading: false,
      DisplayNameEn: "",
      LoginUser: "",
      showDialog: false,
      dialogMessage: "",
    };
    this._sp = getSP();
  }

  async getuserprofile() {
    let user = await this._sp.web.currentUser();
    this.setState({
      LoginUser: user.Email.toLowerCase(),
      DisplayNameEn: user.Title,
    });
  }

  public async componentDidMount(): Promise<void> {
    this.getuserprofile();

    // Fetch data from the list and group by Section
    const items = await this._sp.web.lists
      .getByTitle("Batch_2025_Master_Final")
      .items.select(
        "Title",
        "Name1",
        "Namear",
        "Email",
        "Gender",
        "Age",
        "Nationality",
        "Section"
      )
      .top(300)();
    // Group by section
    const sections = items.reduce(
      (acc: { [x: string]: any[] }, item: { Section: string | number }) => {
        if (!acc[item.Section]) {
          acc[item.Section] = [];
        }
        acc[item.Section].push(item);
        return acc;
      },
      {}
    );
    this.setState({ sections });
  }

  private async fetchAttendance(section: string) {

    console.log("No timetable slot"+this.state.LoginUser.toLowerCase() );
    this.setState({ isLoading: true });

    const currentDayIndex = new Date().getDay();
    const arabicDays = [
      "الأحد", // Sunday
      "الاثنين", // Monday
      "الثلاثاء", // Tuesday
      "الأربعاء", // Wednesday
      "الخميس", // Thursday
      "الجمعة", // Friday
      "السبت", // Saturday
    ];
    const currentDayArabic = arabicDays[currentDayIndex];

    // Fetch the timetable to check if a time slot is available
    const timetableItems = await this._sp.web.lists
      .getByTitle("batch_2_timetable")
      .items.filter(
        //`section eq '${section}' and Day eq '${currentDayArabic}' and Email eq '${this.state.LoginUser.toLowerCase()}'`

        `section eq '${section}' and Day eq '${currentDayArabic}' and Email eq '${this.state.LoginUser.toLowerCase()}'`
      )
      .select("Title", "TimeSlot", "TimeStart", "TimeMax")();

    if (timetableItems.length === 0) {
      this.showDialog(
        "No timetable slot available for this section on the current day."
      );
      this.setState({ isLoading: false });
      return;
    }

    // Get the current time and check if it falls within the timetable slot
    const currentTime = new Date();
    const timetable = timetableItems[0];
    const startTime = this.parseTimeStringToCurrentDate(timetable.TimeStart);
    const endTime = this.parseTimeStringToCurrentDate(timetable.TimeMax);

    if (!(currentTime >= startTime && currentTime <= endTime)) {
      this.showDialog(
        "The current time does not fall within the available timetable slot."
      );
      this.setState({ isLoading: false });
      return;
    }

    // Fetch attendance for the selected section and current day
    const attendanceItems = await this._sp.web.lists
      .getByTitle("student_batch_2025_attendance")
      .items.filter(
        `Section eq '${section}' and Day eq '${currentDayArabic}' and Timeslot eq '${timetable.TimeSlot}'`
      )
      .select("Title", "Status")();

    const attendance = attendanceItems.reduce(
      (acc: { [key: string]: string }, item: { Title: string; Status: string }) => {
        acc[item.Title] = item.Status;
        return acc;
      },
      {}
    );

    // Set state based on whether there are existing records and the current time slot is active
    this.setState({
      attendance,
      currentTimeSlotActive: attendanceItems.length > 0,
      isLoading: false,
    });
  }
  private async insertInitialAttendance(section: string) {
    this.setState({ isLoading: true });
    console.log("insertInitialAttendance"+this.state.LoginUser.toLowerCase());

    const students = this.state.sections[section];

    const arabicDays = [
      "الأحد", // Sunday
      "الاثنين", // Monday
      "الثلاثاء", // Tuesday
      "الأربعاء", // Wednesday
      "الخميس", // Thursday
      "الجمعة", // Friday
      "السبت", // Saturday
    ];

    // Get the current day as an index (0 for Sunday, 1 for Monday, etc.)
    const currentDayIndex = new Date().getDay();
    // Get the corresponding Arabic day name
    const currentDay = arabicDays[currentDayIndex];

    // Fetch the timetable to check if a time slot is available
    const timetableItems = await this._sp.web.lists
      .getByTitle("batch_2_timetable")
      .items.filter
      (`section eq '${section}' and Day eq '${currentDay}' and Email eq '${this.state.LoginUser.toLowerCase()}'`)
      //(`section eq '${section}' and Day eq '${currentDay}' and Email eq 'omniah.alqahtani@nacd.ac.ae'`

      .select("Title", "TimeSlot", "TimeStart", "TimeMax")();

    if (timetableItems.length === 0) {
      this.showDialog(
        "No timetable slot available for this section on the current day."
      );
      this.setState({ isLoading: false });
      return;
    }

    const timetable = timetableItems[0];
    const timeSlot = timetable.TimeSlot;
    const startTime = this.parseTimeStringToCurrentDate(timetable.TimeStart);
    const endTime = this.parseTimeStringToCurrentDate(timetable.TimeMax);

    // Get the current time to compare with the timetable slot
    const currentTime = new Date();

    if (!(currentTime >= startTime && currentTime <= endTime)) {
      this.showDialog(
        "The current time does not fall within the available timetable slot."
      );
      this.setState({ isLoading: false });
      return;
    }

    // Check if attendance records already exist for the same day, slot, and teacher
    const existingRecords = await this._sp.web.lists
      .getByTitle("student_batch_2025_attendance")
      .items.filter(
        `Section eq '${section}' and Day eq '${currentDay}' and Timeslot eq '${timeSlot}' and Teacher eq '${this.state.LoginUser}'`
      )
      .select("Id", "Title", "Status")();

    if (existingRecords.length > 0) {
      // Attendance records exist, so show them to the user for updating
      const attendance = existingRecords.reduce(
        (acc: { [key: string]: string }, item: { Title: string; Status: string }) => {
          acc[item.Title] = item.Status;
          return acc;
        },
        {}
      );

      this.setState({
        attendance,
        currentTimeSlotActive: true,
        isLoading: false,
      });
    } else {
      // Insert all students into the attendance table with Status "N/A"
      for (const student of students) {
        await this._sp.web.lists
          .getByTitle("student_batch_2025_attendance")
          .items.add({
            Title: student.Title,
            Name1: student.Name1,
            Namear: student.Namear || "",
            Email: student.Email,
            Gender: student.Gender || "",
            Age: student.Age || "",
            Nationality: student.Nationality || "",
            Section: student.Section,
            Status: "N/A",
            Teacher: this.state.LoginUser,
            Day: currentDay,
            Timeslot: timeSlot,
            TimeIn: "", // TimeIn will be set when the status is updated
            Timeout: "", // Timeout will be set when the status is updated
          });
      }

      // Fetch the attendance again to reflect the inserted records
      await this.fetchAttendance(section);
    }
}


  parseTimeStringToCurrentDate(timeString: string): Date {
    const [hours, minutes] = timeString.split(":").map(Number);
    const currentDate = new Date();

    // Set the parsed hours and minutes on the current date
    currentDate.setHours(hours, minutes, 0, 0); // Sets the time and resets seconds and milliseconds to zero

    return currentDate;
  }

  private async fetchTimetable(section: string) {
    const currentDate = new Date();

    const arabicDays = [
      "الأحد", // Sunday
      "الاثنين", // Monday
      "الثلاثاء", // Tuesday
      "الأربعاء", // Wednesday
      "الخميس", // Thursday
      "الجمعة", // Friday
      "السبت", // Saturday
    ];

    // Get the current day as an index (0 for Sunday, 1 for Monday, etc.)
    const currentDayIndex = new Date().getDay();
    // Get the corresponding Arabic day name
    const currentDay = arabicDays[currentDayIndex];

    // Fetch timetable for the selected section and current day
    const timetableItems = await this._sp.web.lists
      .getByTitle("batch_2_timetable")
      .items.filter(`section eq '${section}' and Day eq '${currentDay}' and Email eq '${this.state.LoginUser.toLowerCase()}'`)
      .select(
        "Title",
        "Teacher",
        "Day",
        "Subject",
        "TimeStart",
        "TimeMax",
        "TimeSlot",
        "ClassRoom",
        "Techerkey",
        "IsRamdan",
        "Course",
        "Email"
      )();


    if (timetableItems.length > 0) {
      const timetable = timetableItems[0];
      const startTime = this.parseTimeStringToCurrentDate(timetable.TimeStart);
      const endTime = this.parseTimeStringToCurrentDate(timetable.TimeMax);
      const currentTime = new Date();

      // Check if the current time is within the time slot
      const currentTimeSlotActive =
        currentTime >= startTime && currentTime <= endTime;

      if (currentTimeSlotActive) {
        this.setState({ timetable, currentTimeSlotActive: true });
      } else {
        this.setState({ timetable: {}, currentTimeSlotActive: false });
        this.showDialog("No active time slot available at this time.");
      }
    } else {
      this.setState({ timetable: {}, currentTimeSlotActive: false });
      this.showDialog("No time slot available.");
    }
  }

  private async handleAttendanceClick(
    student: any,
    status: string
  ): Promise<void> {
    const currentDate = new Date();
    const currentTime = `${currentDate.getHours()}:${currentDate.getMinutes()}`;

    const arabicDays = [
      "الأحد", // Sunday
      "الاثنين", // Monday
      "الثلاثاء", // Tuesday
      "الأربعاء", // Wednesday
      "الخميس", // Thursday
      "الجمعة", // Friday
      "السبت", // Saturday
    ];

    // Get the current day as an index (0 for Sunday, 1 for Monday, etc.)
    const currentDayIndex = new Date().getDay();
    // Get the corresponding Arabic day name
    const currentDay = arabicDays[currentDayIndex];

    // Update the attendance record for the student
    await this._sp.web.lists
      .getByTitle("student_batch_2025_attendance")
      .items.filter(`Title eq '${student.Title}' and Day eq '${currentDay}'`)
      .top(1)()
      .then(async (items) => {
        if (items.length > 0) {
          const itemId = items[0].Id;

          const updateObject = {
            Status: status,
            TimeIn: currentTime,
            Timeout: status === "Present" ? "" : currentTime, // Set Timeout for Absent or Late
          };

          try {
            await this._sp.web.lists
              .getByTitle("student_batch_2025_attendance")
              .items.getById(itemId)
              .update(updateObject);
            console.log("Item updated successfully");
          } catch (error) {
            console.error("Error updating item: ", error);
          }
        } else {
          console.log("No items found matching the filter criteria.");
        }
      })
      .catch((error) => {
        console.error("Error fetching items: ", error);
      });

    // Update local state to reflect the new attendance status, without disabling the buttons
    this.setState((prevState: any) => ({
      attendance: {
        ...prevState.attendance,
        [student.Title]: status,
      },
    }));
  }

  private async handleSectionClick(section: string): Promise<void> {
    await this.fetchTimetable(section);
    await this.insertInitialAttendance(section);
    await this.fetchAttendance(section);
    this.setState({
      selectedSection: section,
      students: this.state.sections[section],
    });
  }

  private showDialog(message: string) {
    this.setState({ showDialog: true, dialogMessage: message });
  }

  private closeDialog = () => {
    this.setState({ showDialog: false, dialogMessage: "" });
  };

  public render(): React.ReactElement<IWpbatch2025Props> {
    const {
      sections,
      students,
      selectedSection,
      attendance,
      timetable,
      isLoading,
      currentTimeSlotActive,
      showDialog,
      dialogMessage,
    } = this.state;
    const { userDisplayName } = this.props;
  
    return (
      <div className={styles.wpbatch2025}>
        <div className={styles.header}>
          <h1>نظام الحضور دفعة 2</h1>
          <p>مرحباً، , {this.state.DisplayNameEn}</p>
          <div className={styles.sectionButtons}>
            <h3> : اختر القسم</h3>
            <Stack horizontal tokens={{ childrenGap: 10 }}>
              {Object.keys(sections).map((section, index) => (
                <PrimaryButton
                  key={index}
                  text={`شعبة ${section}`}
                  onClick={() => this.handleSectionClick(section)}
                  styles={{
                    root: {
                      fontSize: 14,
                      padding: "5px 10px",
                      backgroundColor: "#83AABA",
                      color: "white",
                    },
                  }} // Small button styling with custom color
                />
              ))}
            </Stack>
          </div>
        </div>
  
        {isLoading ? (
          <Spinner
            label="Loading... Preparing Sheet! Just a sec!"
            size={SpinnerSize.large}
          />
        ) : (
          selectedSection && (
            <div>
              <h3 className={styles.timetableHeading}>
                الجدول الزمني للشعبة : {selectedSection}:
              </h3>
              {currentTimeSlotActive ? (
                <>
                  <div className={styles.timetable}>
                    <p>
                      <strong>المادة:</strong> {timetable.Subject}
                    </p>
                    <p>
                      <strong>المُحاضر:</strong> {timetable.Teacher}
                    </p>
                    <p>
                      <strong> القترة الزمنية :</strong> {timetable.TimeStart} -{" "}
                      {timetable.TimeMax}
                    </p>
                    <p>
                      <strong>الصف :</strong> {timetable.ClassRoom}
                    </p>
                  </div>
  
                  <h3>Students in Section {selectedSection}:</h3>
                  <Stack tokens={{ childrenGap: 10 }}>
                    {students.map(
                      (
                        student: {
                          Name1: any;
                          Namear: any;
                          Email: any;
                          Title: any;
                        },
                        index: React.Key | null | undefined
                      ) => {
                        // Determine the button background color based on the attendance status
                        const status = attendance[student.Title];
                        let statusColor = "#E1E1E1"; // Default color for "N/A" or undefined
  
                        if (status === "Present") {
                          statusColor = "#8AB092"; // Green for Present
                        } else if (status === "Absent") {
                          statusColor = "#F08B75"; // Red for Absent
                        } else if (status === "Late") {
                          statusColor = "#E6CFAC"; // Yellow for Late
                        }
  
                        return (
                          <div key={index} className={styles.studentRow}>
                            <div className={styles.studentDetails}>
                              <span
                                className={styles.studentName}
                                style={{ backgroundColor: statusColor }}
                              >{`${student.Name1} (${student.Email})`}</span>
                              <span
                                className={styles.studentNameAr}
                                style={{ backgroundColor: statusColor }}
                              >{`${student.Namear}`}</span>
                            </div>
                            <Stack
                              horizontal
                              tokens={{ childrenGap: 10 }}
                              className={styles.buttonGroup}
                            >
                              <PrimaryButton
                                text="حاضر"
                                onClick={() =>
                                  this.handleAttendanceClick(student, "Present")
                                }
                                styles={{
                                  root: {
                                    backgroundColor: status === "Present" ? statusColor : "#E1E1E1",
                                    color: "white",
                                  },
                                }}
                              />
                              <PrimaryButton
                                text="متأخر"
                                onClick={() =>
                                  this.handleAttendanceClick(student, "Late")
                                }
                                styles={{
                                  root: {
                                    backgroundColor: status === "Late" ? statusColor : "#E1E1E1",
                                    color: "white",
                                  },
                                }}
                              />
                              <PrimaryButton
                                text="غائب"
                                onClick={() =>
                                  this.handleAttendanceClick(student, "Absent")
                                }
                                styles={{
                                  root: {
                                    backgroundColor: status === "Absent" ? statusColor : "#E1E1E1",
                                    color: "white",
                                  },
                                }}
                              />
                            </Stack>
                          </div>
                        );
                      }
                    )}
                  </Stack>
                </>
              ) : (
                <p className={styles.errorMessage}>
                  No active time slot available for the selected section.
                </p>
              )}
            </div>
          )
        )}
  
        <Dialog
          hidden={!showDialog}
          onDismiss={this.closeDialog}
          dialogContentProps={{
            type: DialogType.normal,
            title: "Information",
            closeButtonAriaLabel: "Close",
            subText: dialogMessage,
          }}
          modalProps={{
            isBlocking: false,
          }}
        >
          <DialogFooter>
            <PrimaryButton onClick={this.closeDialog} text="Close" />
          </DialogFooter>
        </Dialog>
      </div>
    );
  }
  
  
}

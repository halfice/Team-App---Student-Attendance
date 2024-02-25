import { PageContext } from '@microsoft/sp-page-context'; // load page context declaration
import { WebPartContext } from '@microsoft/sp-webpart-base';
export interface IStudentAttendanceProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  pageContext: PageContext;
  wpcontext:WebPartContext;
}

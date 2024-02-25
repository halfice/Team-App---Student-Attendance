import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'StudentAttendanceWebPartStrings';
import StudentAttendance from './components/StudentAttendance';
import { IStudentAttendanceProps } from './components/IStudentAttendanceProps';
import { getSP } from './components/pnpjsConfig';

export interface IStudentAttendanceWebPartProps {
  description: string;
}

export default class StudentAttendanceWebPart extends BaseClientSideWebPart<IStudentAttendanceWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';



  public render(): void {
    const element: React.ReactElement<IStudentAttendanceProps> = React.createElement(
      StudentAttendance,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,
        pageContext: this.context.pageContext,
        wpcontext: this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  public async onInit(): Promise<void> {
    this._environmentMessage = this._getEnvironmentMessage();
    getSP(this.context);
    return super.onInit().then(_ => {
      if (this.context.sdks.microsoftTeams) {
      var context = this.context.sdks.microsoftTeams!.context.theme;
         this._applyTheme(context || 'default');
        this.context.sdks.microsoftTeams.teamsJs.registerOnThemeChangeHandler(this._applyTheme);
      }
    });
  }


  private _applyTheme = (theme: string): void => {
    this.context.domElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }

  private _getEnvironmentMessage(): string {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams
      return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
    }
    return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment;
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }
    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }




  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}

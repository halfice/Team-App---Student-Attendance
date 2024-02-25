import { WebPartContext } from "@microsoft/sp-webpart-base";

// import pnp and pnp logging system
import { spfi, SPFI, SPFx } from "@pnp/sp";
import { LogLevel, PnPLogging } from "@pnp/logging";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/batching";

// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
var _sp: SPFI;

export const getSP = (context?: WebPartContext): SPFI => {
  if (!!context) { // eslint-disable-line eqeqeq
    //You must add the @pnp/logging package to include the PnPLogging behavior it is no longer a peer dependency
    // The LogLevel set's at what level a message will be written to the console
    _sp = spfi('https://nacdeduae.sharepoint.com/sites/StudentAffairs').using(SPFx(context)).using(PnPLogging(LogLevel.Warning));
   // _sp = spfi().using(SPFx(context)).using(PnPLogging(LogLevel.Warning));
  }
  console.log( "Web" +_sp);
  return _sp;
};
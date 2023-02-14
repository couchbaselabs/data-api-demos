let findEndpoint = '/v1/api/scopes/samples/collections/airline/docs?limit=100';
 
function getAPIKey(keyName, promptValue) {
 const userProperties = PropertiesService.getUserProperties();
 let apikey = userProperties.getProperty(keyName);
 let resetKey = false; //Make true if you have to change the keys
 if (apikey == null || resetKey ) {
 var result = SpreadsheetApp.getUi().prompt(
 'Enter '+promptValue,
 promptValue+':', SpreadsheetApp.getUi().ButtonSet);
 apikey = result.getResponseText()
 userProperties.setProperty(keyName, apikey);
 }
 return apikey;
} 
 
function getResultHeaders() {
 const activeSheetsApp = SpreadsheetApp.getActiveSpreadsheet();
 const sheet = activeSheetsApp.getSheets()[0];

 let endpointHost = getAPIKey('ENDPOINTHOST', 'endpoint host')
 if (endpointHost == null || endpointHost == '') {
   endpointHost = 'dapi.couchbase.live'
 }
 if (endpointHost.slice(0,8) == 'https://') {
   findEndpoint = endpointHost+findEndpoint
 } else {
  findEndpoint = 'https://'+endpointHost+findEndpoint
 }
 let apiAccesskey = getAPIKey('APIACCESSKEY', 'access key or username')
 if (apiAccesskey == null || apiAccesskey == '') {
   apiAccesskey = 'username'
 }
 
 let apiSecretkey = getAPIKey('APISECRETKEY', 'secret key or password')
 if (apiSecretkey == null || apiSecretkey == '') {
   apiSecretkey = 'password'
 }

 let scopeName = getAPIKey('SCOPE', 'scope')
 if (scopeName == null || scopeName == '') {
   scopeName = 'inventory'
 }
 findEndpoint = findEndpoint.replace('samples',scopeName)

 const limit = 100;

 const options = {
  method: 'get',
  headers: { 
    'Authorization': 'Basic '+Utilities.base64Encode(apiAccesskey+':'+apiSecretkey)
  }
 };
 
  let response = UrlFetchApp.fetch(findEndpoint, options);
  let documents = JSON.parse(response.getContentText());
 
  documents = documents["docs"];
  // keys
  let allKeys = Object.keys(documents[0].doc); //TBD: get all keys from all docs and merge to get unique keys
  Logger.log(allKeys);
  cols = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
  
  let where = "";
  for (k=0; k<allKeys.length;k++) {
    let val = sheet.getRange(`${cols[k+2]}1`).getValue();
    if ((val.indexOf("=")!=-1) || (val.indexOf("like")!=-1) || (val.indexOf('<')!=-1) || (val.indexOf('>')!=-1)) {
      val = val.toString().replace(' ','+');
      if (where == "") {
        where += val;
      } else {
        where += "+and+"+val;
      }
    }
  }
  if (where != "") {
    where = "&where="+where;
    findEndpoint2 = findEndpoint+where;
    Logger.log(findEndpoint2);
    response = UrlFetchApp.fetch(findEndpoint2, options);
    documents = JSON.parse(response.getContentText());
    documents = documents["docs"];
    sheet.getRange(`${cols[2]}2:${cols[allKeys.length+1]}${limit+1}`).clear();
    Logger.log(documents);
  } else {
    Logger.log("No headers with condition where =");
    sheet.getRange(`${cols[2]}1:${cols[allKeys.length+1]}1`).clear();
    sheet.getRange(`${cols[2]}1:${cols[allKeys.length+1]}1`).setValues([allKeys]);
    sheet.getRange(`${cols[2]}1:${cols[allKeys.length+1]}1`).setFontWeight("bold").setBackgroundRGB(255,100,100).setFontColor("white").setFontSize(12);
  }


  // data
  for (d = 1; d <= documents.length; d++) {
    let values = Object.values(documents[d-1].doc);
    //allKeys = Object.keys(documents[d-1]); 
    sheet.getRange(`${cols[2]}${d+1}:${cols[allKeys.length+1]}${d+1}`).clear();
  }
  for (d = 1; d <= documents.length; d++) {
    let values = Object.values(documents[d-1].doc);
    //allKeys = Object.keys(documents[d-1]); 
    sheet.getRange(`${cols[2]}${d+1}:${cols[allKeys.length+1]}${d+1}`).setValues([values]);
  }

}

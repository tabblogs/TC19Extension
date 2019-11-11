//(function() {
  //load tableau extension

let dashboardDataSources = {};
var userName = "lclark";
let worksheetName = "QuotaAttainment";

tableau.extensions.initializeAsync().then(()=> {
      loadSelectedMarks(worksheetName);

      dashboardDataSources = listDataSources();
      refreshDataSources(dashboardDataSources);

      // userName = getUserName().then(()=>{
      //   console.log("userName: ",userName);
      // })
  });
     
  // This variable will save off the function we can call to unregister listening to marks-selected events
  let unregisterEventHandlerFunction;

  function loadSelectedMarks (worksheetName) {
    // Remove any existing event listeners
    if (unregisterEventHandlerFunction) {
      unregisterEventHandlerFunction();
    }
    
    // Get the worksheet object from which we want to get the selected marks
    const worksheet = getSelectedSheet(worksheetName);

    // Set our title to an appropriate value
    $('#selected_marks_title').text(worksheet.name);

    worksheet.getSummaryDataAsync().then( (data) => {
      const worksheetData = data;

      let field = worksheetData.columns.find(column => column.fieldName === "Sales Person");

      let list = [];
      for (let row of worksheetData.data) {
        list.push(row[field.index].value);
      }
      let values = list.filter((el, i, arr) => arr.indexOf(el) === i);

      const rows = worksheetData.data.map((row, index)=> {
        const rowData = row.map((cell) => {
          return cell.formattedValue;
        });

        return rowData;
      });

      const columns = [{title: field.fieldName}, {title: "Adjustment"}]; 

      populateDataTable(rows, columns);
    });

      // Add an event listener for the selection changed event on this sheet.
    unregisterEventHandlerFunction = worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, (selectionEvent) => {
      // When the selection changes, reload the data
      loadSelectedMarks(worksheetName);
    });
  };

  function populateDataTable (data, columns) {
    $('#formPost').empty();

    if(data.length > 0) {
      $('#no_data_message').css('display', 'none');  

      let form = document.getElementById("formPost");
      data.forEach(element => {
        form.innerHTML += `<div class="form-group row">
                            <div class="form-control">
                              <label>${element[0]}</label> 
                              <input placeholder="adjustment"></input>
                            </div>
                          </div>`;
      })
    } else {
      // If we didn't get any rows back, there must be no marks selected
      $('#no_data_message').css('display', 'inline');
    }

  };
  
  function getSelectedSheet (worksheetName) {
    // Go through all the worksheets in the dashboard and find the one we want
    return tableau.extensions.dashboardContent.dashboard.worksheets.find((sheet)=> {
      return sheet.name === worksheetName;
    });
  };

  function listDataSources(){
    let localdashboardDataSources = {};
    let dataSourceFetchPromises = [];
    const dashboard = tableau.extensions.dashboardContent.dashboard;

    // Then loop through each worksheet and get its dataSources, save promise for later.
    dashboard.worksheets.forEach(function (worksheet) {
      dataSourceFetchPromises.push(worksheet.getDataSourcesAsync());
    });

    Promise.all(dataSourceFetchPromises).then(function (fetchResults) {
      fetchResults.forEach(function (dataSourcesForWorksheet) {
        dataSourcesForWorksheet.forEach(function (dataSource) {
          if (!dashboardDataSources[dataSource.id]) { // We've already seen it, skip it.
            dashboardDataSources[dataSource.id] = dataSource;
          }
        });
      });

    });
    return localdashboardDataSources;
  }

  function refreshDataSources(dashboardDataSources){
    for (let dataSourceId in dashboardDataSources) {
      const dataSource = dashboardDataSources[dataSourceId];
      dataSource.refreshAsync().then(function () {
        console.log(dataSource.name + ': Refreshed Successfully');
      });
    }
  }
//})();
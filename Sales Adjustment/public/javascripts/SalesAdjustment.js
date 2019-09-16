(function() {
    //load tableau extension
    tableau.extensions.initializeAsync().then(()=> {
      getUserName();
      loadSelectedMarks("QuotaAttainment");
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
    console.log(worksheet.name);

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
  }

  function populateDataTable (data, columns) {
    // Do some UI setup here to change the visible section and reinitialize the table
    $('#data_table_wrapper').empty();

    if (data.length > 0) {
      $('#no_data_message').css('display', 'none');
      $('#data_table_wrapper').append(`<table id='data_table' >`);

      console.log("popDataTable: ", data);
      data.forEach(element => {
        console.log("forEach", element)
        $('#data_table_wrapper').append(`<div class="form-group row"> <div class="input-grup mb-3"> <div class="input-group-prepend">`);
        $('#data_table_wrapper').append(element[0]);
        $('#data_table_wrapper').append(`</div></div></div>`);
        //$('#data_table_wrapper').append(`</td></tr>`);
        
      });
      
      $('#data_table_wrapper').append(`</table>`);

      // // Do some math to compute the height we want the data table to be
      // var top = $('#data_table_wrapper')[0].getBoundingClientRect().top;
      // var height = $(document).height() - top - 130;

      // // Initialize our data table with what we just gathered
      // $('#data_table').DataTable({
      //   data: data,
      //   columns: columns,
      //   autoWidth: true,
      //   authHeight: true,
      //   deferRender: true,
      //   scroller: true,
      //   scrollY: height,
      //   scrollX: true,
      //   dom: "<'row'<'col-sm-6'i><'col-sm-6'f>><'row'<'col-sm-12'tr>>" // Do some custom styling
      //   //rowReorder: true
      // });
    } else {
      // If we didn't get any rows back, there must be no marks selected
      $('#no_data_message').css('display', 'inline');
    }
  }

  function getSelectedSheet (worksheetName) {
    // Go through all the worksheets in the dashboard and find the one we want
    return tableau.extensions.dashboardContent.dashboard.worksheets.find((sheet)=> {
      return sheet.name === worksheetName;
    });
  }

  function getUserName() {
    usernamesheet = tableau.extensions.dashboardContent.dashboard.worksheets.find(w=>w.name==="currentUserSheet");
    usernamesheet.getSummaryDataAsync().then( (data) => {
      console.log("getUSerName columns: ",data.columns[0].data[0]);
      console.log("getUSerName data: ",data);
    });
  };
})();
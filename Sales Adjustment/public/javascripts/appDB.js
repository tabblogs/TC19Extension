function postAdjustment(){

  let input = document.querySelectorAll(".form-control");
  console.log("input: ",input)
  console.log("inner text:", input[0].innerText)
  console.log("value: ",input[0].lastElementChild.value)

  var postObject = {};
  var insertData = []; 
  const name = "lclark"; //getUserName();

  for(i=0;i<input.length;i++){
    const salesperson = input[i].innerText.trim();
    const adjustment = input[i].lastElementChild.value.trim();
    //const index = i+1;
    insertData.push({userName:name});
    insertData.push({salesperson:salesperson});
    insertData.push({adjustment:adjustment});
  }

  postObject.data = insertData;
  console.log("postObject: ",postObject);
  postData(JSON.stringify(postObject));
};

postData = (insertData) => {
  console.log("insertData: ",insertData);

  return new Promise( (resolve, reject) => {
  fetch("/postData", {
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    body: insertData
  })
    .then(function(response) {
      const r = response.json();
      return r;
    })
    .then(function(myJson) {
      $('#result').text(JSON.stringify(myJson));
      return(myJson);
    })
    .catch(function(err) {
      if (err) {
        throw err;
      }
    });
  });
}

function getUserName() {
  usernamesheet = tableau.extensions.dashboardContent.dashboard.worksheets.find(w=>w.name==="currentUserSheet");
  return usernamesheet.getSummaryDataAsync().then( (currentUserData) => {
    return currentUserData.data[0][0].value;
  });
};
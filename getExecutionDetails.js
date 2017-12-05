const request = require("request");
const rp = require('request-promise');
const util = require('util');

const executionId = process.argv[2];
const baseUrl = 'https://console.cloud-elements.com/elements/api-v2' //US Production 
const userSecret = 'XXXXX';
const orgSecret = 'XXXXX';
const authHeader = `User ${userSecret}, Organization ${orgSecret}`;

let executionData;

let getExecutionRequestOptions = { 
  method: 'GET',
  url: `${baseUrl}/formulas/instances/executions/${executionId}/steps`, //US Production
  headers: { 
    'Authorization': authHeader,
    'accept': 'application/json'
  }
}

rp(getExecutionRequestOptions)
.then(function(steps) {
  executionData = JSON.parse(steps);
  let stepIds = executionData.map(function(step) {
    return step.id;
  })
  stepValueRequests = stepIds.map(function(stepId, i) {
    let valueRequestOptions = { 
      method: 'GET',
      url: `${baseUrl}/formulas/instances/executions/steps/${stepId}/values`,
      headers: { 
        'Authorization': authHeader,
        'accept': 'application/json'
      }
    }
    
    return rp(valueRequestOptions)
      .then(function(response) {
        let stepData = JSON.parse(response);
        executionData[i].stepValues = stepData;
      }).catch(function(error) {
        console.error(JSON.parse(error.error).message)
      })
  })
  Promise.all(stepValueRequests).then(values => { 
    console.log(util.inspect(executionData, {showHidden: false, depth: null}))
  }).catch(err => {
    console.error("ERR: ", err);
  })
});



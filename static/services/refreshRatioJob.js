
function refreshRatioJob() {

    fetch('https://localhost:7115/api/Currency/Update_ratio')
        .then(response => {

            console.log('Endpoint called successfully');
        })
        .catch(error => {

            console.error('Error calling endpoint:', error);
        });
}

refreshRatioJob();


setInterval(refreshRatioJob, 900000); 

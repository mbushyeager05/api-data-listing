console.log('👍 JS Connected');

// Scripting

// Data source
//const url = "";

// Get data
fetch(url)
  .then( response  => response.json())
  .then( data  => {
    
    // check-check: is the data good?
    console.log(data);
    console.log(data.Name);
    console.log(data.Image);

    // get container for data
    const dataContainer = document.querySelector(".dataContainer");

    // loop through data
    data.forEach( student => {
      
      // template
      const template = ``;

      // insert EACH `student` record into container
      dataContainer.insertAdjacentHTML("afterbegin", template);
    });
  });
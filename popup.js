const timeShow = document.querySelector("#timeShow");
const DayStatus = document.querySelector("#DayStatus");
const totalTimeVal = document.querySelector("#totalTimeVal");

function convertTo24HoursFormat(timeSlots) {
  const convertedTimeSlots = [];

  for (const slot of timeSlots) {
    const convertedSlot = slot.map(time => {
      if (time !== "MISSING") {
        const [timePart, meridian] = time.split(' ');
        let [hours, minutes, seconds] = timePart.split(':');

        // Convert to 24-hour format
        if (meridian === "PM" && hours !== "12") {
          hours = String(parseInt(hours, 10) + 12);
        } else if (meridian === "AM" && hours === "12") {
          hours = "00";
        }
        return `${hours}:${minutes}:${seconds || '00'}`;
      } else {
        return time; // Leave "MISSING" as it is
      }
    });
    convertedTimeSlots.push(convertedSlot);
  }

  return convertedTimeSlots;
}

function getCurrentTime() {

  //this is the original code******************************
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const currentTime = `${hours}:${minutes}:${seconds}`;
  return currentTime;
  //********************************************************/

  // return '21:09:09';
}

function calculateTotalTime(timeSlots) {
  try{
    let shouldStopTime=1
    let shouldRegularize=0;
    let totalMilliseconds = 0;
    let regularizationAddOn=0;
    let OfficetotalSeconds=0;

    for(let i = 0; i < timeSlots.length; i++){
      
      
      let slot=timeSlots[i];
      const [entryTime, exitTime] = slot;
      // Parse time strings into Date objects
      let entryDate = new Date(`2000-01-01T${entryTime}`);
      let exitDate = new Date(`2000-01-01T${exitTime}`);
      // Check if the Date objects are invalid
      if (isNaN(entryDate) || isNaN(exitDate)) {
  
        if(i===(timeSlots.length-1) && isNaN(exitDate)){
          exitDate=new Date(`2000-01-01T${getCurrentTime()}`);
          shouldStopTime=0;
        }
        else{
          console.log(`Invalid time format in entry: ${entryTime} or exit: ${exitTime}`);
          //for calculation of regularization addOn
          //case1:ALL case  special case i.e [[MISSING, 7:09:09 PM],[7:59:20 PM, 08:09:09 PM]]
          if(i!==0){
            regularizationAddOn+=isNaN(exitDate)?(new Date(`2000-01-01T${timeSlots[i+1][0]}`) - entryDate):(exitDate - new Date(`2000-01-01T${timeSlots[i-1][1]}`));
          
          }
          else if(i===0 && isNaN(exitDate)){
            regularizationAddOn+=isNaN(exitDate)?(new Date(`2000-01-01T${timeSlots[i+1][0]}`) - entryDate):(exitDate - new Date(`2000-01-01T${timeSlots[i-1][1]}`));
          }
          entryDate=0;
          exitDate=0;
          shouldRegularize=1;
        }
        
      }
  
      // Calculate time difference in milliseconds
      const timeDiffInMillis = exitDate - entryDate;

      
      
      // Accumulate the time differences
      totalMilliseconds += timeDiffInMillis;

      console.log("exitData:",exitDate,", entryData:",entryDate,", Millisec:",totalMilliseconds)

      
      
    };
  
  
    // Check if the totalMilliseconds is a valid number
    if (isNaN(totalMilliseconds)) {
      console.error("Error calculating total time");
      return "Invalid Time Calculation";
    }

    
    

    //to cal total time in office 
    if(!shouldStopTime){
      //current time se lena hai
      OfficetotalSeconds=new Date(`2000-01-01T${getCurrentTime()}`) - new Date(`2000-01-01T${timeSlots[0][0]}`);
    }
    else{
      OfficetotalSeconds=new Date(`2000-01-01T${timeSlots[timeSlots.length-1][1]}`) - new Date(`2000-01-01T${timeSlots[0][0]}`);
      //last slot se lena hai
    }

    // Convert total milliseconds to hours, minutes, and seconds
    const totalSeconds = Math.floor(OfficetotalSeconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
  
    // Format the total time as HH:mm:ss
    const totalTime = `${String(hours)}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;

    console.log("the result object is here: ",totalTime,shouldStopTime,shouldRegularize,regularizationAddOn);


    return {totalMilliseconds,totalTime,shouldStopTime,shouldRegularize,regularizationAddOn};

  }
  catch(err){
    console.log("got some bhai",err);
    return "SOMETHING WENT WRONG IN calculateTotalTime() function"
  }



  
}

const calculateWrapUP=(secondsCompleted)=>{
  if(secondsCompleted>28800){
    return -108;
  }

  try{
    const totalSecondsIn8Hours = 8 * 60 * 60;
    const now = new Date();
 
   // Calculate seconds left
   const secondsLeft = totalSecondsIn8Hours - secondsCompleted;
   const completionTime = new Date(now.getTime() + secondsLeft * 1000);
 
   return completionTime.toLocaleTimeString(); // Format the time
  }
  catch(err){
    console.log("error in calculateWrapUP function",err);
  }
  
   

}

const CalculateTotalTimeFromSlotArray=(timeSlots)=>{
  //lets first change every item to 24hours time format;
  const convertedTimeSlots=convertTo24HoursFormat(timeSlots);
  //calculating total time of the day
  const totalTime=calculateTotalTime(convertedTimeSlots);
  
  return totalTime;
}


  // Fetch the time from the webpage
const extractFromWebPage = () => {
  try{
  // *****************this is the original logic*************************************************
  
  if(document.getElementsByClassName("dropdown-menu dropdown-menu-right dropdown-menu-logs clear-padding-t show").length===0){
    const temp=document.querySelector(".ki.ki-accent-yellow.ki-error");
    temp.click()  
  }
  
  const timeSlots=[];
  let parentDIV=document.getElementsByClassName("dropdown-menu dropdown-menu-right dropdown-menu-logs clear-padding-t show");
  parentDIV=Array.from(parentDIV);
  let timeElement = parentDIV[0].querySelectorAll(".d-flex.mt-10");
  console.log(timeElement);
  timeElement?.forEach(eachTimeElement => {
    const eachTimeSlot=[];
    const spans = eachTimeElement.querySelectorAll("span:not(.invisible)");
    spans.forEach(span => {
      const timeEntry=span.textContent.trim();
      if(timeEntry!=""){eachTimeSlot.push(timeEntry);}
    });
    timeSlots.push(eachTimeSlot);
  });
  // // ****************************************************************************************** */
  // const timeSlots = [
  //   ["1:05:06 PM", "MISSING"]
  // ];
  console.log("extractFromWebPage Function :",timeSlots);
  return timeSlots;
  }

  catch(err){
    console.log("Unable to extract the time from the DOM",err);
  }
};


document.addEventListener("DOMContentLoaded", function () {

  pkj();
});
const pkj = async () => {
  
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  try {
    chrome.scripting.executeScript({
      target: { tabId: tab?.id },
      function: pkjFunctionWrapper(extractFromWebPage),  
    },






    async (injectionResult) => {
      //your timeSlots=injectionResult[0].result
      //now here my timeSlot is ready now i am calculating the total time from each slots 
      const {totalMilliseconds,totalTime,shouldStopTime,shouldRegularize,regularizationAddOn}=CalculateTotalTimeFromSlotArray(injectionResult[0].result) || -1;
      console.log("totalMilliseconds,totalTime,shouldStopTime,shouldRegularize,regularizationAddOn",totalMilliseconds,totalTime,shouldStopTime,shouldRegularize,regularizationAddOn);
      let totalSeconds=totalMilliseconds/1000;
        const hourss = Math.floor(totalSeconds / 3600);
        const minutess = Math.floor((totalSeconds % 3600) / 60);
        const secondss = totalSeconds % 60;
        const updatedTimeString = `<span style="font-size: medium;font-weight: 600; "><span style="font-size: xx-large; font-weight: 500;">${hourss}</span><span style="margin-inline: 1px;">h</span><span style="margin-inline: 7px"><span style="font-size: xx-large; font-weight: 500;">${minutess<10?'0'+minutess:minutess}</span><span style="margin-inline: 1px;">m</span></span><span style="font-size: xx-large; font-weight: 500;">${secondss<10?'0'+secondss:secondss}</span><span style="margin-inline: 1px;">s</span></span>`;
        timeShow.innerHTML = updatedTimeString;
       
      // // Create a function to update the timer every second
      function updateTimer() {
        totalSeconds++; // Increment the totalSeconds
        const hours = Math.floor(totalSeconds / 3600);
        let minutes = Math.floor((totalSeconds % 3600) / 60);
        let seconds = totalSeconds % 60;
        const updatedTimeString = `<span style="font-size: medium;font-weight: 600; "><span style="font-size: xx-large; font-weight: 500;">${hours}</span><span style="margin-inline: 1px;">h</span><span style="margin-inline: 7px"><span style="font-size: xx-large; font-weight: 500;">${minutes<10?'0'+minutes:minutes}</span><span style="margin-inline: 1px;">m</span></span><span style="font-size: xx-large; font-weight: 500;">${seconds<10?'0'+seconds:seconds}</span><span style="margin-inline: 1px;">s</span></span>`;
        timeShow.innerHTML = updatedTimeString;
        console.log("timer update kr rha hun!!")
      }
    
      // Call the updateTimer function every second
      if(!shouldStopTime){
        const wrapUpTime=calculateWrapUP(totalSeconds)
        DayStatus.innerHTML=`Wrapping up at <strong>${wrapUpTime}!</strong>&#128171;`
        totalTimeVal.innerText=`${totalTime}`
        const timerInterval = setInterval(updateTimer, 1000);

      }
      else{
        DayStatus.innerHTML="<strong>Ta-da!</strong> Workday finished!! &#128640; &#129321; &#128131;"
        totalTimeVal.innerText=`${totalTime}`
      }
      
    }
    








    );
  } catch (err) {
    console.error(err);
  }
};
const pkjFunctionWrapper = (innerWebPageFunction) => {
  return innerWebPageFunction;
};




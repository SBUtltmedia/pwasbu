/*
 * This file contains all functions related to exporting assessments to XLSX files
 */

/*
 * Exports assessment packet of all athletes as a zipped directory of XLSX files
 */
function exportAllAssessmentPackets() {
  fs.collection("users").where("priv", "==", "camper").get().then((res) => {
    // Data for each athlete (array of objects, each object holds the id and the actual data)
    let allCampers = res.docs.map(doc => doc.data());
    // Array of promises that will resolve to workbook objects
    let allWorkbookPromises = [];
    // Creating a workbook object for each athlete
    for (let camper of allCampers) {
      let camperID = camper.id;
      // Creating a promise that will resolve to a workbook object
      allWorkbookPromises.push(generateWorkbook(camperID));
    };
    // List of workbook objects that were generated successfully
    let successfullyGeneratedWorkbooks = [];
    // List of athletes whose assessment packets were not exported successfully
    let unsuccessfulExportCampers = [];
    // Waiting for all promises to be either fulfilled of rejected.
    // Using Promise.allSettled() instead of Promise.all() since
    Promise.allSettled(allWorkbookPromises).then((allWorkbookResults) => {
      for (let i = 0; i < allWorkbookResults.length; i++) {
        let result = allWorkbookResults[i];
        // Separating fulfilled and rejected promises
        if (result.status == "rejected") {
        // Keeping track of which athletes' workbooks were not generated successfully in order to notify user
          let unsuccessfulExportCamper = allCampers[i];
          console.group(`Failed to export assessment packet for ${unsuccessfulExportCamper.firstName} ${unsuccessfulExportCamper.lastName} (id=${unsuccessfulExportCamper.id})`);
          console.log(result.reason);
          console.groupEnd();
          unsuccessfulExportCampers.push(allCampers[i]);
        } else {
        // Keeping track of which workbooks were generated successfully in order to export them as XLSX files
          successfullyGeneratedWorkbooks.push(result.value);
        }
      }
      // Exporting successfully fulfilled workbook objects as a zipped directory of XLSX files
      exportWorkbooks(successfullyGeneratedWorkbooks).then(() => {
        if (unsuccessfulExportCampers > 0) {
          // Notifying user of which athletes' assessment packets were not exported successfully
          let unsuccessfulExportCampersString = "";
          for (unsuccessfulExportCamper of unsuccessfulExportCampers) {
            unsuccessfulExportCampersString += `\n\t${unsuccessfulExportCamper.firstName} ${unsuccessfulExportCamper.lastName} (id=${unsuccessfulExportCamper.id})`;
          }
          alert(`Failed to export assessment packets for these athletes: ${unsuccessfulExportCampersString}`);
        } else {
          alert("Successfully exported assessment packets");
        }
      }).catch((err) => {
        // Notifying user that the assessment packets were not exported successfully
        console.log("Failed to export assessment packets:");
        console.log(err);
        alert("Failed to export assessment packets");
      });

    });
  });
}

/*
 * Exports inputted workbook objects as a zipped directory of XLSX files
 */
function exportWorkbooks(workbooks) {
  // If no workbooks are inputted, then return a promise that will be rejected since no workbooks are exported
  if (workbooks.length <= 0) {
    return new Promise((resolve, reject) => setTimeout(reject, 100, 'No workbooks were generated successfully'));
  }

  // Creating instance of JSZip
  let zip = new JSZip();
  // Adding all workbooks to JSZip instance
  for (let workbook of workbooks) {
    // Generating workbook in binary format
    let workbookBinary = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
    // Adding workbook to JSZip instance
    zip.file(`${workbook.Props.Title}.xlsx`, workbookBinary, { binary: true });
  }
  // Generating zipped directory with all added workbooks
  return zip.generateAsync({ type: "blob" }).then((zippedAssessments) => {
    // Downloading zipped directory of workbooks
    return saveAs(zippedAssessments, `Camp_Abilities_Assessments_${(new Date()).getFullYear()}.zip`);
  });
}

/*
 * Exports assessment packet of specified athlete as an XLSX file
 */
function exportAssessmentPacket(camperID) {
  // Creating the workbook object that will be exported as an XLSX file (the athlete's assessment packet)
  generateWorkbook(camperID).then((workbook) => {
    // Exporting the workbook object as an XLSX file (the athlete's assessment packet)
    exportWorkbook(workbook);
  }).catch((err) => {
    console.log(`Failed to export assessment packet for Athlete with ID ${camperID}:`);
    console.log(err);
    alert(`Failed to export assessment packet for Athlete with ID ${camperID}`);
  });
}

/*
 * Exports inputted workbook object as an XLSX file
 */
function exportWorkbook(workbook) {
  let workbookBinary = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
  saveAs(new Blob([binToOct(workbookBinary)], { type: "application/octet-stream" }), `${workbook.Props.Title}.xlsx`);
}

/*
 * Returns a promise that resolves to a workbook object containing all assessments of the specified athlete.
 * Each sheet in the workbook correponds to one assessment. There will be a sheet for each activity,
 * since it is assumed that the athlete is assessed for each activity.
 */
function generateWorkbook(camperID) {
  // The workbook object that will be returned
  let workbook = XLSX.utils.book_new();
  // Getting the camper's information
  return fs.collection("users").where("id", "==", camperID).get().then((res) => {
    let camperData = res.docs[0].data();
    // Setting the properties of the workbook
    workbook.Props = {
      Title: `${camperData["firstName"]}_${camperData["lastName"]}_${camperID}`,
      Subject: "Assessment Packet",
      CreatedDate: new Date()
    }
    // Getting all activities
    return fs.collection("Activities").get().then((res) => {
      // Data for each activity
      let allActivities = res.docs.map(doc => doc.data());
      // Templates for assessments of each activity
      let allAssessmentTemplates = [];
      for (let i = 0; i < allActivities.length; i++) {
        let activity = allActivities[i];
        allAssessmentTemplates.push(generateAssessmentTemplate(activity));
      }
      // Getting all assessments of the specified athlete
      return fs.collection("Evaluations").where("camper", "==", camperID).get().then((res) => {
        // Data for each assessment
        let allAssessments = res.docs.map(doc => doc.data());
        // Outer for-loop iterating over allActivities to ensure that a sheet is made for every activity (even if no assessment for that activity exists)
        for (let i = 0; i < allActivities.length; i++) {
          let activity = allActivities[i];
          let assessmentTemplate = allAssessmentTemplates[i];
          // Count of how many assessments of this activity exist
          let assessmentCount = 0;
          // Creating a sheet for each assessment
          for (let assessment of allAssessments) {
            if (assessment.activityName === activity.name) {
              // Generating a 2d array of the template filled in with data from the assessment
              let completedWorksheet = generateCompletedWorksheet(activity, assessmentTemplate, assessment);
              // Sheet is named the same as the activity
              // If there are multiple assessments of the same activity, then an incrementing count is added to the sheet name
              let sheetName = (assessmentCount <= 0) ? activity.name : `${activity.name} (${assessmentCount})`;
              workbook.SheetNames.push(sheetName);
              let worksheet = XLSX.utils.aoa_to_sheet(completedWorksheet);
              workbook.Sheets[sheetName] = worksheet;
              // Incrementing number of assessments for this activity
              assessmentCount++;
            }
          }
          // Add empty template sheet if there are no assessments for this activity
          if (assessmentCount <= 0) {
            // Sheet is named the same as the activity
            workbook.SheetNames.push(activity.name);
            // Empty template used instead of filling with data
            let worksheet = XLSX.utils.aoa_to_sheet(allAssessmentTemplates[i]);
            workbook.Sheets[activity.name] = worksheet;
          }
        }

        // Returning workbook object
        return workbook;
      });
    });
  });
}

/*
 * Returns a 2D array that acts as a template for an assessment of the specified activity
 */
function generateAssessmentTemplate(activity) {
  // First line is header of Skills section
  let template = [["Skills", "Score", "Comments"]];
  // Adding a line for each skill and subskill
  for (let skill of activity.skills) {
    template.push([skill.skillName.toUpperCase(), "", ""]);
    for (let subSkill of skill.subSkills) {
      template.push([subSkill, "", ""]);
    }
  }

  // Adding a line of spacing between Skills section and Daily Checklist section
  template.push(["", "", ""]);

  // Adding a line for header of Daily Checklist section
  template.push(["Daily Checklist", "", ""]);

  return template;
}

/*
 * Returns a 2D array following the provided template but with actual data filled in
 */
function generateCompletedWorksheet(activity, assessmentTemplate, assessment) {
  // Cloning 2d arrray template so as to not alter the actual template itself
  let worksheetToComplete = JSON.parse(JSON.stringify(assessmentTemplate));

  // Filling in skills data (assignment not necessary b/c pass by reference, but doing just to make operation very explicit)
  worksheetToComplete = fillInSkillsData(activity, assessmentTemplate, assessment, worksheetToComplete)
  // Filling in daily checklist data (assignment not necessary b/c pass by reference, but doing just to make operation very explicit)
  worksheetToComplete = fillInChecklistData(activity, assessmentTemplate, assessment, worksheetToComplete);

  // Ensuring that all rows of the 2d array have the same length
  // (assignment not necessary b/c pass by reference, but doing just to make operation very explicit)
  let completedWorksheet = setMaxWidth(worksheetToComplete);

  return completedWorksheet;
}

/*
 * Returns a 2D array following the provided template but with actual skills data filled in
 */
function fillInSkillsData(activity, assessmentTemplate, assessment, worksheetToComplete) {
  // The sheet is filled top->down so currLine is the line that is currently being filled out
  // Since the first line of the sheet is the header of the Skills section, currLine starts at 1 instead of 0
  let currLine = 1;
  // ******************** Filling in data for Skills ********************
  for (let skillIndex = 0; skillIndex < activity.skills.length; skillIndex++) {
    let skill = activity.skills[skillIndex];
    let skillAssessment = assessment.skills[`skill_${skillIndex + 1}`];
    // No data actually inputted on the line of the skill name
    currLine++;
    // Filling in data for subskills
    for (let subSkillIndex = 0; subSkillIndex < skill.subSkills.length; subSkillIndex++) {
      let subSkillAssessment = skillAssessment[subSkillIndex];
      // Format of subSkill in worksheet: Name, Score, Comments
      worksheetToComplete[currLine][1] = subSkillAssessment.score;
      worksheetToComplete[currLine][2] = subSkillAssessment.comment;
      // Moving onto the next line of the sheet
      currLine++;
    }
  }

  // Return not necessary b/c pass by reference, but doing just to make operation very explicit
  return worksheetToComplete;
}

/*
 * Returns a 2D array following the provided template but with actual checklist data filled in
 */
function fillInChecklistData(activity, assessmentTemplate, assessment, worksheetToComplete) {
  // ******************** Filling in data for Daily Checklist ********************
  // Getting dates when data was recorded
  let dateStrs = [];
  // Mapping Date objects with string representations for easy access to both
  Object.keys(assessment.dailyCheckList).forEach(dateString => {
    dateStrs.push(dateString);
  });
  // // Sorting in ascending order
  dateStrs.sort();
  // Adding data for each day
  for (let dateIndex = 0; dateIndex < dateStrs.length; dateIndex++) {
    let dateString = dateStrs[dateIndex];
    // Maps (checklist item index + 1) to array of tials of the checklist item
    let checklistData = assessment.dailyCheckList[dateString];
    // The row that contains the date on which this data was recorded
    let dateRow = [dateString];
    worksheetToComplete.push(dateRow);

    // Keeping track of max number of trials in order to enumerate trials in the sheet
    let maxTrials = 0;
    // ******************** Filling in data for Trials ********************
    for (let checklistIndex = 0; checklistIndex < Object.keys(checklistData).length; checklistIndex++) {
      // Contains name and unit of measure of the current checklist item
      let checklistItem = activity.checklist[checklistIndex];
      // The row in the sheet that contains the name, unit of measure, and trials of the current checklist item
      let checklistDataRow = [`${checklistItem.name} (${checklistItem.type})`];
      // Array of trials of the current checklist item
      let checklistItemTrials = checklistData[checklistIndex + 1];
      // Adding each trial to the row of trials
      for (trial of checklistItemTrials) {
        checklistDataRow.push(trial);
      }
      // Updating max number of trials
      if (checklistItemTrials.length > maxTrials) {
        maxTrials = checklistItemTrials.length;
      }
      // Adding row of trial data to the actual worksheet
      worksheetToComplete.push(checklistDataRow);
    }

    // Enumerating trials in the date row
    for (let trialNum = 1; trialNum <= maxTrials; trialNum++) {
      dateRow.push(`Trial #${trialNum}`);
    }

    // Adding a line of spacing between different Skills
    worksheetToComplete.push([""]);
  }

  // Return not necessary b/c pass by reference, but doing just to make operation very explicit
  return worksheetToComplete;
}

/*
 * Ensures that all rows of the inputted 2d array have the same length by adding any necessary extra entries of empty strings
 */
function setMaxWidth(arrOfArr) {
  // Getting the length of the longest row of the inputted 2d array
  let maxWidth = 0;
  for (let row of arrOfArr) {
    if (row.length > maxWidth) {
      maxWidth = row.length;
    }
  }
  // Adding empty strings to any rows that are not the same length as maxWidth to ensure that every row has length maxWidth
  for (let row of arrOfArr) {
    for (let i = row.length; i < maxWidth; i++) {
      row.push("");
    }
  }

  // Return not necessary b/c pass by reference, but doing just to make operation very explicit
  return arrOfArr;
}

/*
 * Converts binary input to octet
 */
function binToOct(bin) {
  let buf = new ArrayBuffer(bin.length);
  let view = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) {
    view[i] = bin.charCodeAt(i) & 0xFF;
  }
  return buf;
}

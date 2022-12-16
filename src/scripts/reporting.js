const fs = require('fs');
const { settings } = require('cluster');
const { report } = require('process');


module.exports = {

    generateReport: async (
        timeDetail,
        savePath,
        cloudData,
        localData,
        window) => {
        try {
            let returnedSettings;
            const settings = await window.preload.getSettings();
            returnedSettings = { ...settings }
            const reportText = generateReportText(cloudData, timeDetail);
            const reportingComplete = await writeReportToCsv(reportText, savePath);
            return reportingComplete;
        } catch (error) {
            if (error === "connection error") {
                window.preload.WindowsNotifications("Cannot connect!", "Please connect to network drive", "exclamation_mark_64.png", 3500, returnedSettings.altNotifications, window);
            }
        }
    }
}


const generateReportText = (cloudData, timeDetail) => {
    cloudData.sort(function (a, b) {
        return new Date(b.logDate) - new Date(a.logDate);
    });
    const reportText = []
    cloudData.forEach(log => {
        const desk = log.user_code;
        const date = new Date(log.log_date)
        const count = 1;
        if (timeDetail === 'raw') {
            const day = date.toLocaleDateString();
            const time = date.toLocaleTimeString();
            reportText.push({ day, time, desk, count })
        } else if (timeDetail === 'day') {
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            const day = date.toLocaleDateString();
            const time = date.toLocaleTimeString();
            const dateIndex = reportText.findIndex(reportLog => reportLog.day === day && reportLog.desk === desk);
            if (dateIndex < 0) {
                reportText.push({ day, time, desk, count });
            } else {
                reportText[dateIndex].count += count;
            }
        } else if (timeDetail === 'hour') {
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            const day = date.toLocaleDateString();
            const time = date.toLocaleTimeString();
            const dateIndex = reportText.findIndex(reportLog => reportLog.time === time && reportLog.day === day && reportLog.desk === desk);
            if (dateIndex < 0) {
                reportText.push({ day, time, desk, count });
            } else {
                reportText[dateIndex].count += count;
            }
        }
    })
    return reportText;
}

const writeReportToCsv = (reportText, filePath) => {
    return new Promise((resolve, reject) => {
        let outputString = "Date,Time,Desk,Count"
    reportText.forEach(log => {
        outputString += '\r\n' + log.day + ',' + log.time + ',"' + log.desk + '",' + log.count;
    });
    filePath += '\\op_report.csv';
    fs.writeFile(
        filePath,
        outputString, {
        encoding: "UTF-8",
        flag: "a"
    },
        function (err) {
            if (err) {
                console.log(err)
                resolve(false);
            } else {
                resolve(true);
            }
        });

    })
    
}

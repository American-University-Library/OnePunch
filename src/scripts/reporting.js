const fs = require('fs');

module.exports = {
    generateReportText: (cloudData, timeDetail) => {
        cloudData.sort(function (a, b) {
            return new Date(b.logDate) - new Date(a.logDate);
        });
        const reportText = [];
        cloudData.forEach(log => {
            const desk = log.user_code;
            const date = new Date(log.log_date);
            const count = 1;
            if (timeDetail === 'raw') {
                const day = date.toLocaleDateString();
                const time = date.toLocaleTimeString();
                reportText.push({ day, time, desk, count });
            } else if (timeDetail === 'day') {
                date.setHours(0, 0, 0, 0);
                const day = date.toLocaleDateString();
                const time = date.toLocaleTimeString();
                const dateIndex = reportText.findIndex(reportLog => reportLog.day === day && reportLog.desk === desk);
                if (dateIndex < 0) {
                    reportText.push({ day, time, desk, count });
                } else {
                    reportText[dateIndex].count += count;
                }
            } else if (timeDetail === 'hour') {
                date.setMinutes(0, 0, 0);
                const day = date.toLocaleDateString();
                const time = date.toLocaleTimeString();
                const dateIndex = reportText.findIndex(reportLog => reportLog.time === time && reportLog.day === day && reportLog.desk === desk);
                if (dateIndex < 0) {
                    reportText.push({ day, time, desk, count });
                } else {
                    reportText[dateIndex].count += count;
                }
            }
        });
        return reportText;
    },

    writeReportToCsv: (reportText, filePath) => {
        return new Promise((resolve, reject) => {
            let outputString = "Date,Time,Desk,Count";
            reportText.forEach(log => {
                outputString += '\r\n' + log.day + ',' + log.time + ',"' + log.desk + '",' + log.count;
            });
            const timestamp = new Date().toISOString().slice(0, 10);
            filePath += `\\op_report_${timestamp}.csv`;
            fs.writeFile(filePath, outputString, { encoding: "UTF-8", flag: "w" }, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }
};

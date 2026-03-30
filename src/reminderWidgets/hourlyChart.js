// Reminder window widget: hourly bar chart
// Interface: window.reminderWidget.render(container, logs)
//   container — the DOM element to render into
//   logs      — array of log objects with a log_date field, or null if offline

window.reminderWidget = {
    render: (container, logs) => {
        const START_HOUR = 9;
        const END_HOUR = 21; // 9 PM inclusive
        const currentHour = new Date().getHours();

        // Build hourly buckets
        const hours = [];
        for (let h = START_HOUR; h <= END_HOUR; h++) {
            hours.push({ hour: h, count: 0 });
        }

        if (logs && logs.length) {
            logs.forEach(log => {
                const h = new Date(log.log_date).getHours();
                const bucket = hours.find(b => b.hour === h);
                if (bucket) bucket.count++;
            });
        }

        const maxCount = Math.max(...hours.map(h => h.count), 1);

        const BAR_AREA_HEIGHT = 70; // px, not including labels

        const bars = hours.map(({ hour, count }) => {
            const isCurrent = hour === currentHour;
            const isPast = hour < currentHour;
            const heightPct = count > 0 ? Math.max((count / maxCount) * 100, 8) : 0;

            let barColor;
            if (isCurrent) {
                barColor = '#e8944b'; // owl orange — current hour
            } else if (isPast) {
                barColor = '#c8a882'; // muted brown — past
            } else {
                barColor = '#e8e0d8'; // light — future
            }

            const label = formatHourLabel(hour);
            const showLabel = hour === START_HOUR || hour === END_HOUR || hour % 3 === 0;

            return `
                <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:2px;">
                    <div style="
                        width:100%;
                        height:${BAR_AREA_HEIGHT}px;
                        display:flex;
                        align-items:flex-end;
                    ">
                        <div style="
                            width:100%;
                            height:${heightPct}%;
                            background:${barColor};
                            border-radius:2px 2px 0 0;
                            min-height:${count > 0 ? 3 : 0}px;
                        "></div>
                    </div>
                    <span style="
                        font-size:14px;
                        color:#999;
                        white-space:nowrap;
                        font-weight:bold;
                        visibility:${showLabel ? 'visible' : 'hidden'};
                    ">${label}</span>
                </div>`;
        }).join('');

        const offlineNote = !logs
            ? `<div style="font-size:10px; color:#bbb; text-align:center; margin-top:2px;">offline - showing local count</div>`
            : '';

        container.innerHTML = `
            <div style="padding: 0 16px 10px 16px;">
                <div style="display:flex; align-items:flex-end; gap:2px;">
                    ${bars}
                </div>
                ${offlineNote}
            </div>`;
    }
};

function formatHourLabel(hour) {
    if (hour === 12) return '12p';
    if (hour === 9) return '9a';
    if (hour > 12) return (hour - 12).toString() + 'p';
    return hour.toString();
}

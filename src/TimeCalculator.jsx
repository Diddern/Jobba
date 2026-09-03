import { useEffect, useState, useRef } from 'react';
import { Switch } from 'pretty-checkbox-react';
import '@djthoms/pretty-checkbox';
import './App.css';

function TimeCalculator() {
    const [totalWorkedMinutes, setTotalWorkedMinutes] = useState(0);
    const [intervals, setIntervals] = useState([{ start: '', end: '' }]);
    const [lunchChecked, setLunchChecked] = useState(true);
    const [decimalHours, setDecimalHours] = useState(false);
    const startTimeInputRef = useRef(null);
    const contentRef = useRef(null);

    const calculateTotalTime = () => {
        let totalMinutes = 0;
        intervals.forEach(interval => {
            if (interval.start && interval.end) {
                const [startHour, startMinute] = interval.start.split(':').map(Number);
                const [endHour, endMinute] = interval.end.split(':').map(Number);
                totalMinutes += (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
            }
        });

        if (lunchChecked) {
            totalMinutes -= 30;
        }

        setTotalWorkedMinutes(totalMinutes);
    };

    // Formaterer arbeidstiden som enten desimaltimer ("7.5 timer")
    // eller timer og minutter ("7 timer og 30 minutter")
    const formatWorkedTime = (minutes) => {
        if (decimalHours) {
            const hours = Math.round((minutes / 60) * 100) / 100;
            return `${hours} ${hours === 1 ? 'time' : 'timer'}`;
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        const parts = [];

        if (hours > 0) {
            parts.push(hours === 1 ? '1 time' : `${hours} timer`);
        }
        if (remainingMinutes > 0) {
            parts.push(remainingMinutes === 1 ? '1 minutt' : `${remainingMinutes} minutter`);
        }

        return parts.join(' og ');
    };

    useEffect(() => {
        calculateTotalTime();
    }, [intervals, lunchChecked]);

    useEffect(() => {
        startTimeInputRef.current.focus();
    }, []);

    useEffect(() => {
        chrome.storage.sync.get(['lunchChecked', 'decimalHours'], (result) => {
            // If the value exists in storage, use it
            if (result.lunchChecked !== undefined) {
                setLunchChecked(result.lunchChecked);
            }
            if (result.decimalHours !== undefined) {
                setDecimalHours(result.decimalHours);
            }
        });
    }, []);


    const addInterval = () => {
        setIntervals([...intervals, { start: '', end: '' }]);

        setTimeout(() => {
            const contentHeight = contentRef.current.scrollHeight;
            if (contentHeight > 600) {
                contentRef.current.scrollTop = contentRef.current.scrollHeight;
            }
        }, 100);
    };
    const removeInterval = () => {
        setIntervals(intervals.slice(0, -1));
    };

    const handleStartTimeChange = (index, value) => {
        const newIntervals = [...intervals];
        newIntervals[index].start = value;
        setIntervals(newIntervals);
        if (value && newIntervals[index].end) {
            calculateTotalTime();
        }
    };

    const handleEndTimeChange = (index, value) => {
        const newIntervals = [...intervals];
        newIntervals[index].end = value;
        setIntervals(newIntervals);
        if (value && newIntervals[index].start) {
            calculateTotalTime();
        }
    };

    const handleLunchCheckboxChange = (e) => {
        const newValue = e.target.checked;
        setLunchChecked(newValue);

        // Update the value in browser storage
        chrome.storage.sync.set({ lunchChecked: newValue });
    };

    return (
        <div>
            <div className="header">
                <h1>Jobba</h1>
            </div>
            <div className="calculator">
                {intervals.map((interval, index) => (
                    <div key={index} className="interval">
                        <p>Når startet du?</p>
                        <input
                            type="time"
                            value={interval.start}
                            onChange={(e) => handleStartTimeChange(index, e.target.value)}
                            ref={startTimeInputRef}
                            className="time-input"
                        />
                        <p>Når var du ferdig?</p>
                        <input
                            type="time"
                            value={interval.end}
                            onChange={(e) => handleEndTimeChange(index, e.target.value)}
                            className="time-input"
                        />
                    </div>
                ))}
                <div className="button-container">
                    <button onClick={addInterval} className="link-button">Legg til intervall</button>
                    {intervals.length > 1 && (
                        <>
                            <button onClick={removeInterval} className="link-button">Fjern intervall</button>
                        </>
                    )}
                </div>
            </div>
            <label htmlFor="lunchCheckbox">Lunsj?</label>
            <Switch
                color="success"
                checked={lunchChecked}
                onChange={handleLunchCheckboxChange}
            />
            <div className="footer">
                {totalWorkedMinutes > 0 && (
                    <h2>
                        Du har jobba i {formatWorkedTime(totalWorkedMinutes)}
                    </h2>
                )}
            </div>
        </div>
    );
}

export default TimeCalculator;
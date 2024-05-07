import React, { useState, useEffect, useRef } from 'react';
import { Switch } from "pretty-checkbox-react";
import '@djthoms/pretty-checkbox';
import './App.css';

function TimeCalculator() {
    const [totalHours, setTotalHours] = useState(0);
    const [totalMinutes, setTotalMinutes] = useState(0);
    const [intervals, setIntervals] = useState([{ start: '', end: '' }]);
    const [lunchChecked, setLunchChecked] = useState(true);
    const startTimeInputRef = useRef(null);


    useEffect(() => {
        calculateTotalTime();
    }, [intervals, lunchChecked]);

    useEffect(() => {
        startTimeInputRef.current.focus();
    }, []);

    useEffect(() => {
        // Retrieve the value of "lunchChecked" from browser storage
        chrome.storage.sync.get(['lunchChecked'], (result) => {
            // If the value exists in storage, use it
            if (result.lunchChecked !== undefined) {
                setLunchChecked(result.lunchChecked);
            }
        });
    }, []);

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

        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;

        setTotalHours(totalHours);
        setTotalMinutes(remainingMinutes);
    };

    const addInterval = () => {
        setIntervals([...intervals, { start: '', end: '' }]);
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
                    {intervals.length > 1 && <hr/>}
                    {intervals.length > 1 && (
                        <button onClick={removeInterval} className="link-button">Fjern intervall</button>
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
                <div className="result">

                {(totalHours > 0 || totalMinutes > 0) && (
                    <h2>
                        Du har jobba i{' '}
                        {totalHours === 1 ? '1 time' : totalHours > 0 ? `${totalHours} timer` : ''}{' '}
                        {totalHours > 0 && totalMinutes > 0 ? 'og ' : ''}
                        {totalMinutes > 0 && `${totalMinutes} minutter`}
                    </h2>
                )}
                </div>
            </div>
        </div>
    );
}

export default TimeCalculator;

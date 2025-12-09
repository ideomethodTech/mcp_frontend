import React from 'react';
import useApiStore from '../store/useApiStore';

const StoreTest = () => {
    const {
        lessonPlanStatus,
        chatStatus,
        worksheetStatus,
        answerKeyStatus,
        setLessonPlanStatus,
        setChatStatus,
        setWorksheetStatus,
        setAnswerKeyStatus,
        resetAll
    } = useApiStore();

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
            <h2>Store Test</h2>
            <div>
                <p>Lesson Plan Status: <strong>{lessonPlanStatus}</strong></p>
                <button onClick={() => setLessonPlanStatus('loading')}>Set Loading</button>
                <button onClick={() => setLessonPlanStatus('success')}>Set Success</button>
                <button onClick={() => setLessonPlanStatus('error')}>Set Error</button>
            </div>
            <div style={{ marginTop: '10px' }}>
                <p>Chat Status: <strong>{chatStatus}</strong></p>
                <button onClick={() => setChatStatus('loading')}>Set Loading</button>
                <button onClick={() => setChatStatus('success')}>Set Success</button>
                <button onClick={() => setChatStatus('error')}>Set Error</button>
            </div>
            <div style={{ marginTop: '10px' }}>
                <p>Worksheet Status: <strong>{worksheetStatus}</strong></p>
                <button onClick={() => setWorksheetStatus('loading')}>Set Loading</button>
                <button onClick={() => setWorksheetStatus('success')}>Set Success</button>
                <button onClick={() => setWorksheetStatus('error')}>Set Error</button>
            </div>
            <div style={{ marginTop: '10px' }}>
                <p>Answer Key Status: <strong>{answerKeyStatus}</strong></p>
                <button onClick={() => setAnswerKeyStatus('loading')}>Set Loading</button>
                <button onClick={() => setAnswerKeyStatus('success')}>Set Success</button>
                <button onClick={() => setAnswerKeyStatus('error')}>Set Error</button>
            </div>
            <div style={{ marginTop: '20px' }}>
                <button onClick={resetAll} style={{ backgroundColor: 'red', color: 'white' }}>Reset All</button>
            </div>
        </div>
    );
};

export default StoreTest;

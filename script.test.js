const fs = require('fs');
const path = require('path');

// Mock localStorage
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Read and load the HTML content
const html = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');

describe('Mood Tracker', () => {
  let saveMood;

  beforeEach(() => {
    // Reset document
    document.body.innerHTML = html;

    // Clear mock
    window.localStorage.clear();
    jest.clearAllMocks();

    // Reset moods state inside the script module before importing
    // Because moods is initialized when the file loads, we need to reset module cache
    jest.resetModules();

    const script = require('./script.js');
    saveMood = script.saveMood;
  });

  it('saves a mood entry correctly', () => {
    const noteInput = document.getElementById('note');
    noteInput.value = 'Feeling great today!';

    saveMood('😊', 'Happy');

    // Verify local storage is called
    expect(window.localStorage.setItem).toHaveBeenCalled();

    const savedData = JSON.parse(window.localStorage.setItem.mock.calls[0][1]);
    expect(savedData.length).toBe(1);
    expect(savedData[0].emoji).toBe('😊');
    expect(savedData[0].label).toBe('Happy');
    expect(savedData[0].note).toBe('Feeling great today!');
    expect(savedData[0].time).toBeDefined();

    // Verify input is cleared
    expect(noteInput.value).toBe('');

    // Verify DOM updates
    const historyContainer = document.getElementById('history');
    expect(historyContainer.innerHTML).toContain('😊');
    expect(historyContainer.innerHTML).toContain('Happy');
    expect(historyContainer.innerHTML).toContain('Feeling great today!');
  });

  it('saves multiple moods and adds to the top', () => {
    const noteInput = document.getElementById('note');

    noteInput.value = 'First entry';
    saveMood('😐', 'Okay');

    noteInput.value = 'Second entry';
    saveMood('😊', 'Happy');

    const savedData = JSON.parse(window.localStorage.setItem.mock.calls[1][1]);
    expect(savedData.length).toBe(2);
    // New entry should be at the top
    expect(savedData[0].emoji).toBe('😊');
    expect(savedData[0].note).toBe('Second entry');
    expect(savedData[1].emoji).toBe('😐');
    expect(savedData[1].note).toBe('First entry');
  });

  it('saves mood without a note', () => {
    const noteInput = document.getElementById('note');
    noteInput.value = ''; // empty note

    saveMood('😴', 'Tired');

    const savedData = JSON.parse(window.localStorage.setItem.mock.calls[0][1]);
    expect(savedData.length).toBe(1);
    expect(savedData[0].emoji).toBe('😴');
    expect(savedData[0].label).toBe('Tired');
    expect(savedData[0].note).toBe('');

    const historyContainer = document.getElementById('history');
    expect(historyContainer.innerHTML).toContain('😴');
    expect(historyContainer.innerHTML).toContain('Tired');
  });
});

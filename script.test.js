describe('Mood Tracker', () => {
  let saveMood;
  let render;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div class="container">
        <input type="text" id="note" placeholder="Add a quick note (optional)">
        <div id="history"></div>
      </div>
    `;

    // Mock localStorage
    const localStorageMock = (function () {
      let store = {};
      return {
        getItem: function (key) {
          return store[key] || null;
        },
        setItem: function (key, value) {
          store[key] = value.toString();
        },
        clear: function () {
          store = {};
        }
      };
    })();

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    // Clear the localStorage mock
    window.localStorage.clear();

    // Reset modules and reload script.js to start with a fresh state
    jest.resetModules();
    const app = require('./script.js');
    saveMood = app.saveMood;
    render = app.render;

    // Set a predictable Date object
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with empty history when localStorage is empty', () => {
    const historyElement = document.getElementById('history');
    expect(historyElement.innerHTML).toContain('No entries yet');
  });

  it('saves a mood to localStorage and renders it', () => {
    const noteInput = document.getElementById('note');
    noteInput.value = 'Feeling great today!';

    saveMood('😊', 'Happy');

    // Check localStorage
    const savedMoods = JSON.parse(window.localStorage.getItem('moods'));
    expect(savedMoods).toHaveLength(1);
    expect(savedMoods[0].emoji).toBe('😊');
    expect(savedMoods[0].label).toBe('Happy');
    expect(savedMoods[0].note).toBe('Feeling great today!');
    expect(savedMoods[0].time).toBe(new Date().toLocaleString());

    // Check DOM (input should be cleared)
    expect(noteInput.value).toBe('');

    // Check DOM (rendered element)
    const historyElement = document.getElementById('history');
    expect(historyElement.innerHTML).toContain('😊');
    expect(historyElement.innerHTML).toContain('Happy');
    expect(historyElement.innerHTML).toContain('Feeling great today!');
  });

  it('saves a mood without a note', () => {
    const noteInput = document.getElementById('note');
    noteInput.value = ''; // Empty note

    saveMood('😐', 'Okay');

    const savedMoods = JSON.parse(window.localStorage.getItem('moods'));
    expect(savedMoods).toHaveLength(1);
    expect(savedMoods[0].note).toBe('');

    const historyElement = document.getElementById('history');
    expect(historyElement.innerHTML).toContain('😐');
    expect(historyElement.innerHTML).toContain('Okay');
    expect(historyElement.innerHTML).not.toContain('—'); // Note separator shouldn't be there
  });

  it('adds new moods to the top of the history list', () => {
    saveMood('😐', 'Okay');
    saveMood('😊', 'Happy');

    const savedMoods = JSON.parse(window.localStorage.getItem('moods'));
    expect(savedMoods).toHaveLength(2);
    expect(savedMoods[0].emoji).toBe('😊'); // Most recent first
    expect(savedMoods[1].emoji).toBe('😐');
  });
});
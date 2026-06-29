/**
 * @jest-environment jsdom
 */

describe('Mood Tracker', () => {
  let saveMood;
  let render;

  beforeEach(() => {
    // Reset module registry to clear module-level state (`let moods`)
    jest.resetModules();

    // Mock localStorage
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
        clear: jest.fn(() => { store = {}; }),
        removeItem: jest.fn((key) => { delete store[key]; })
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

    // Set up DOM
    document.body.innerHTML = `
      <input type="text" id="note" placeholder="Add a quick note (optional)">
      <div id="history"></div>
    `;

    // Load module (this executes the script which accesses localStorage and calls render)
    const script = require('./script.js');
    saveMood = script.saveMood;
    render = script.render;

    // Mock Date to ensure deterministic timestamps
    jest.spyOn(global, 'Date').mockImplementation(() => ({
      toLocaleString: () => '1/1/2023, 12:00:00 PM'
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('render()', () => {
    it('should display "No entries yet" when there are no moods', () => {
      // By default localStorage is empty in beforeEach, so let's call render
      render();
      const historyDiv = document.getElementById('history');
      expect(historyDiv.innerHTML).toContain('No entries yet');
    });

    it('should display existing moods from localStorage on load', () => {
      // Set localStorage before requiring the module
      window.localStorage.setItem('moods', JSON.stringify([
        { emoji: '😊', label: 'Happy', note: 'Feeling great!', time: '1/1/2023, 12:00:00 PM' }
      ]));

      // Reload the module to pick up the new localStorage value
      jest.resetModules();
      const script = require('./script.js');
      render = script.render;

      render();
      const historyDiv = document.getElementById('history');
      expect(historyDiv.innerHTML).not.toContain('No entries yet');
      expect(historyDiv.innerHTML).toContain('😊');
      expect(historyDiv.innerHTML).toContain('Happy');
      expect(historyDiv.innerHTML).toContain('Feeling great!');
      expect(historyDiv.innerHTML).toContain('1/1/2023, 12:00:00 PM');
    });
  });

  describe('saveMood()', () => {
    it('should save a single mood to localStorage and render it', () => {
      const noteInput = document.getElementById('note');
      noteInput.value = 'Had a good lunch';

      saveMood('😊', 'Happy');

      // Check localStorage
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'moods',
        JSON.stringify([{ emoji: '😊', label: 'Happy', note: 'Had a good lunch', time: '1/1/2023, 12:00:00 PM' }])
      );

      // Check input was cleared
      expect(noteInput.value).toBe('');

      // Check DOM update
      const historyDiv = document.getElementById('history');
      expect(historyDiv.innerHTML).toContain('😊');
      expect(historyDiv.innerHTML).toContain('Happy');
      expect(historyDiv.innerHTML).toContain('Had a good lunch');
      expect(historyDiv.innerHTML).toContain('1/1/2023, 12:00:00 PM');
    });

    it('should handle saving a mood without a note', () => {
      const noteInput = document.getElementById('note');
      noteInput.value = '';

      saveMood('😐', 'Okay');

      const historyDiv = document.getElementById('history');
      expect(historyDiv.innerHTML).toContain('😐');
      expect(historyDiv.innerHTML).toContain('Okay');
      expect(historyDiv.innerHTML).not.toContain('—'); // Note separator should not be there
    });

    it('should prepend new moods to the list', () => {
      const noteInput = document.getElementById('note');

      noteInput.value = 'First entry';
      saveMood('😢', 'Sad');

      noteInput.value = 'Second entry';
      saveMood('😡', 'Angry');

      // Check localStorage to ensure 'Angry' is first
      const storedMoods = JSON.parse(window.localStorage.getItem.mock.results.find(r => r.value !== null)?.value || window.localStorage.setItem.mock.calls[1][1]);

      expect(storedMoods.length).toBe(2);
      expect(storedMoods[0].emoji).toBe('😡');
      expect(storedMoods[1].emoji).toBe('😢');

      // Check DOM to ensure correct rendering order
      const historyDiv = document.getElementById('history');
      const entries = historyDiv.querySelectorAll('.entry');
      expect(entries.length).toBe(2);
      expect(entries[0].innerHTML).toContain('😡');
      expect(entries[1].innerHTML).toContain('😢');
    });
  });
});

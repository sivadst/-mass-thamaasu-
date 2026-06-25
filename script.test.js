const { render, saveMood, getMoods, setMoods } = require('./script.js');

describe('render function', () => {
  beforeEach(() => {
    // Set up mock DOM
    document.body.innerHTML = `
      <div class="container">
        <input type="text" id="note" placeholder="Add a quick note (optional)">
        <h2>History</h2>
        <div id="history"></div>
      </div>
    `;

    // Mock localStorage
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => {
          store[key] = value.toString();
        }),
        clear: jest.fn(() => {
          store = {};
        })
      };
    })();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    setMoods([]); // Reset the global state between tests
  });

  test('renders "No entries yet" when moods array is empty', () => {
    setMoods([]);
    render();

    const container = document.getElementById('history');
    expect(container.innerHTML).toContain('No entries yet');
    expect(container.innerHTML).toContain('color:#888');
  });

  test('renders multiple entries correctly', () => {
    const mockMoods = [
      { emoji: '😊', label: 'Happy', note: 'Great day', time: '1/1/2023, 10:00:00 AM' },
      { emoji: '😢', label: 'Sad', note: '', time: '1/1/2023, 11:00:00 AM' }
    ];
    setMoods(mockMoods);

    render();

    const container = document.getElementById('history');
    const entries = container.querySelectorAll('.entry');

    expect(entries.length).toBe(2);

    // Check first entry
    expect(entries[0].innerHTML).toContain('😊');
    expect(entries[0].innerHTML).toContain('Happy');
    expect(entries[0].innerHTML).toContain('Great day');
    expect(entries[0].innerHTML).toContain('1/1/2023, 10:00:00 AM');

    // Check second entry (no note)
    expect(entries[1].innerHTML).toContain('😢');
    expect(entries[1].innerHTML).toContain('Sad');
    expect(entries[1].innerHTML).not.toContain('—'); // No note separator should be rendered
    expect(entries[1].innerHTML).toContain('1/1/2023, 11:00:00 AM');
  });
});

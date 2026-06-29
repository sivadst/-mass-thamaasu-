// Load existing moods or start empty
let moods = JSON.parse(localStorage.getItem('moods')) || [];

function saveMood(emoji, label) {
  const note = document.getElementById('note').value;
  const entry = {
    emoji,
    label,
    note,
    time: new Date().toLocaleString()
  };
  
  moods.unshift(entry); // Add to top
  localStorage.setItem('moods', JSON.stringify(moods));
  document.getElementById('note').value = '';
  render();
}

function render() {
  const container = document.getElementById('history');
  if (moods.length === 0) {
    container.innerHTML = '<p style="color:#888;text-align:center">No entries yet</p>';
    return;
  }
  
  container.innerHTML = moods.map(m => `
    <div class="entry">
      <div>
        <span class="emoji">${m.emoji}</span>
        <strong>${m.label}</strong>
        ${m.note ? '— ' + m.note : ''}
      </div>
      <span class="time">${m.time}</span>
    </div>
  `).join('');
}

render();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { saveMood, render };
}
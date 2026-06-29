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
  
  moods.push(entry); // Add to end, O(1) performance
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
  
  let html = '';
  for (let i = moods.length - 1; i >= 0; i--) {
    const m = moods[i];
    html += `
    <div class="entry">
      <div>
        <span class="emoji">${m.emoji}</span>
        <strong>${m.label}</strong>
        ${m.note ? '— ' + m.note : ''}
      </div>
      <span class="time">${m.time}</span>
    </div>
  `;
  }
  container.innerHTML = html;
}

render();
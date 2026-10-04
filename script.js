const parcelForm = document.getElementById('parcelForm');
const parcelTableBody = document.querySelector('#parcelTable tbody');
const searchInput = document.getElementById('searchInput');
const filterStatus = document.getElementById('filterStatus');
const sortByDateBtn = document.getElementById('sortByDate');
const exportCSVBtn = document.getElementById('exportCSV');
const clearAllBtn = document.getElementById('clearAll');

let parcels = JSON.parse(localStorage.getItem('parcels')) || [];
let sortAscending = true;

function saveParcels() {
  localStorage.setItem('parcels', JSON.stringify(parcels));
}

function renderParcels() {
  const searchValue = searchInput.value.toLowerCase();
  const statusFilter = filterStatus.value;

  const filteredParcels = parcels.filter(parcel => {
    const matchesSearch =
      parcel.sender.toLowerCase().includes(searchValue) ||
      parcel.receiver.toLowerCase().includes(searchValue) ||
      parcel.tracking.toLowerCase().includes(searchValue);
    const matchesStatus = statusFilter === 'All' || parcel.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  parcelTableBody.innerHTML = '';

  filteredParcels.forEach((parcel, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${parcel.sender}</td>
      <td>${parcel.receiver}</td>
      <td>${parcel.tracking}</td>
      <td>
        <select onchange="updateStatus(${index}, this.value)">
          <option ${parcel.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option ${parcel.status === 'In Transit' ? 'selected' : ''}>In Transit</option>
          <option ${parcel.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      </td>
      <td>${parcel.date}</td>
      <td>
        <button onclick="editParcel(${index})">✏️</button>
        <button onclick="deleteParcel(${index})">🗑️</button>
      </td>
    `;
    parcelTableBody.appendChild(row);
  });
}

parcelForm.addEventListener('submit', e => {
  e.preventDefault();
  const sender = document.getElementById('sender').value.trim();
  const receiver = document.getElementById('receiver').value.trim();
  const tracking = document.getElementById('tracking').value.trim();
  const status = document.getElementById('status').value;
  const date = new Date().toLocaleString();

  if (sender && receiver && tracking) {
    parcels.push({ sender, receiver, tracking, status, date });
    saveParcels();
    parcelForm.reset();
    renderParcels();
  }
});

function updateStatus(index, newStatus) {
  parcels[index].status = newStatus;
  saveParcels();
  renderParcels();
}

function deleteParcel(index) {
  if (confirm("Delete this parcel?")) {
    parcels.splice(index, 1);
    saveParcels();
    renderParcels();
  }
}

function editParcel(index) {
  const parcel = parcels[index];
  document.getElementById('sender').value = parcel.sender;
  document.getElementById('receiver').value = parcel.receiver;
  document.getElementById('tracking').value = parcel.tracking;
  document.getElementById('status').value = parcel.status;
  parcels.splice(index, 1);
  saveParcels();
  renderParcels();
}

searchInput.addEventListener('input', renderParcels);
filterStatus.addEventListener('change', renderParcels);

sortByDateBtn.addEventListener('click', () => {
  parcels.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortAscending ? dateA - dateB : dateB - dateA;
  });
  sortAscending = !sortAscending;
  renderParcels();
});

exportCSVBtn.addEventListener('click', () => {
  if (parcels.length === 0) return alert("No parcels to export!");
  let csv = "Sender,Receiver,Tracking,Status,Date\n";
  parcels.forEach(p => {
    csv += `${p.sender},${p.receiver},${p.tracking},${p.status},${p.date}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = "parcels.csv";
  link.click();
});

clearAllBtn.addEventListener('click', () => {
  if (confirm("Clear all parcel records?")) {
    parcels = [];
    saveParcels();
    renderParcels();
  }
});

renderParcels();

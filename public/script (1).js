const colleges = {
  "College of Science": ["Computer Science","Biological Science","Mathematics","Biochemistry","Optometry","Acturial Science","Environmental Science","Nutrition","Metorological Science","Physics","Statistics"],
  "College of Humanities and Social Sciences": ["English","History","Philosophy","Languages","Sociology","Psychology","Economics"],
  "College of Art and Built Environment": ["Architecture","Fine Arts","Design","Building Technology","Real Estate"],
  "College of Engineering": ["Civil Engineering","Electrical Engineering","Mechanical Engineering","Computer Engineering","Chemical Engineering","Materials Engineering"],
  "College of Health Sciences": ["Medicine","Nursing","Pharmacy","Veterinary Medicine","Public Health"]
};

function populateCollegeSelect(collegeSelectId, deptSelectId) {
  const cSel = document.getElementById(collegeSelectId);
  const dSel = document.getElementById(deptSelectId);
  if (!cSel || !dSel) return;
  cSel.innerHTML = '<option value="">Choose college...</option>';
  Object.keys(colleges).forEach((col) => {
    const o = document.createElement('option');
    o.value = col;
    o.textContent = col;
    cSel.appendChild(o);
  });
  cSel.addEventListener('change', () => {
    const deps = colleges[cSel.value] || [];
    dSel.innerHTML = '<option value="">Choose department...</option>';
    deps.forEach((dep) => {
      const op = document.createElement('option');
      op.value = dep;
      op.textContent = dep;
      dSel.appendChild(op);
    });
  });
}

function saveToLocal(key, obj) {
  const arr = JSON.parse(localStorage.getItem(key) || '[]');
  arr.unshift(obj);
  localStorage.setItem(key, JSON.stringify(arr.slice(0, 50)));
}
function getFromLocal(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}
function clearLocal(key) {
  localStorage.removeItem(key);
}
function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, (s) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}

function renderLostItems() {
  const c = document.getElementById('lostItemsContainer');
  if (!c) return;
  const items = getFromLocal('lostItems');
  c.innerHTML = items.length
    ? items.map((it) => `<div class="list-card"><strong>${escapeHtml(it.fullname)}</strong> — ${escapeHtml(it.description)}<br/><small>${escapeHtml(it.college)} / ${escapeHtml(it.department)} • ${escapeHtml(it.phone || '')}</small></div>`).join('')
    : '<p>No lost items yet.</p>';
}

function renderFoundItems(filter = '') {
  const c = document.getElementById('foundItemsContainer');
  if (!c) return;
  let items = getFromLocal('foundItems');
  if (filter) {
    const q = filter.toLowerCase();
    items = items.filter((i) => (`${i.description || ''} ${i.college || ''} ${i.department || ''}`.toLowerCase().includes(q)));
  }
  c.innerHTML = items.length
    ? items.map((it) => {
      const img = it.imageData ? `<div><img src="${it.imageData}" style="max-width:140px;border-radius:8px;margin-top:8px"/></div>` : '';
      return `<div class="list-card"><strong>${escapeHtml(it.finderName)}</strong> — ${escapeHtml(it.description)}<br/><small>${escapeHtml(it.college)} / ${escapeHtml(it.department)} • Found at: ${escapeHtml(it.foundPlace)}</small>${img}</div>`;
    }).join('')
    : '<p>No found items yet.</p>';
}

function logout() {
  localStorage.removeItem('authToken');
  window.location.href = 'Login.html';
}

function ensureAuthenticated() {
  const token = localStorage.getItem('authToken');
  const isLoginPage = location.pathname.endsWith('Login.html');
  if (!token && !isLoginPage) {
    window.location.href = 'Login.html';
    return false;
  }
  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  if (!ensureAuthenticated()) return;
  document.querySelectorAll('#year,#year2,#year3,#year4').forEach((el) => el && (el.textContent = new Date().getFullYear()));
  populateCollegeSelect('lostCollege', 'lostDepartment');
  populateCollegeSelect('foundCollege', 'foundDepartment');

  const lostForm = document.getElementById('lostForm');
  if (lostForm) {
    // NEW: Staff toggle logic
    const isStaffChk = document.getElementById('isStaff');
    const staffFields = document.getElementById('staffFields');
    if (isStaffChk) {
      isStaffChk.addEventListener('change', () => {
        staffFields.style.display = isStaffChk.checked ? 'block' : 'none';
        if (isStaffChk.checked) {
          document.getElementById('lostDepartment').required = false;  // Hide student dept
        } else {
          document.getElementById('lostDepartment').required = true;
        }
      });
    }
    lostForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fd = new FormData(lostForm);
      const email = fd.get('email') || '';
      if (!email) { alert('Email is required'); return; }

      const payload = {
        fullname: fd.get('fullname') || '',
        sex: fd.get('sex') || '',
        college: document.getElementById('lostCollege')?.value || '',
        department: document.getElementById('lostDepartment')?.value || '',
        phone: fd.get('phone') || '',
        email,
        description: fd.get('description') || '',
        hostel: document.getElementById('hostelSelect')?.value || '',
        offcampus: fd.get('offcampus') || '',
        createdAt: new Date().toISOString()
      };

      try {
        const res = await fetch('/api/lost', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('authToken')
          },
          body: fd
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Server error');
        saveToLocal('lostItems', payload);
        renderLostItems();
        alert('Lost Report submitted Thank you');
        lostForm.reset();
      } catch (err) {
        console.error('Lost submit failed:', err);
        saveToLocal('lostItems', payload);
        renderLostItems();
        alert('Saved locally. Could not reach server: ' + (err.message || 'unknown error'));
      }
    });
    renderLostItems();
  }

  const foundForm = document.getElementById('foundForm');
  if (foundForm) {
    // NEW: Found ID radios logic (mutually exclusive)
    const studentRadio = document.getElementById('studentRadio');
    const staffRadio = document.getElementById('staffRadio');
    const studentIdInput = document.getElementById('studentIdInput');
    const staffIdInput = document.getElementById('staffIdInput');
    if (studentRadio && staffRadio && studentIdInput && staffIdInput) {
      const clearOther = (currentInput) => {
        if (currentInput === studentIdInput) staffIdInput.value = '';
        else studentIdInput.value = '';
      };
      studentRadio.addEventListener('change', () => studentIdInput.focus());
      staffRadio.addEventListener('change', () => staffIdInput.focus());
      studentIdInput.addEventListener('input', () => clearOther(studentIdInput));
      staffIdInput.addEventListener('input', () => clearOther(staffIdInput));
    }

    foundForm.addEventListener('submit', async (e) => {

      e.preventDefault();
      const fd = new FormData(foundForm);
      const email = fd.get('email') || '';
      if (!email) { alert('Email is required'); return; }

      let imageData = '';
      const imageInput = document.getElementById('foundUpload');
      if (imageInput?.files?.[0]) {
        imageData = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(imageInput.files[0]);
        });
      }

      const payload = {
        finderName: fd.get('finderName') || '',
        finderSex: fd.get('finderSex') || '',
        ageRange: document.getElementById('finderAge')?.value || '',
        college: document.getElementById('foundCollege')?.value || '',
        department: document.getElementById('foundDepartment')?.value || '',
        foundPlace: fd.get('foundPlace') || '',
        description: fd.get('foundDescription') || '',
        imageData,
        createdAt: new Date().toISOString()
      };

      try {
        const res = await fetch('/api/found', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('authToken')
          },
          body: fd
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Server error');
        saveToLocal('foundItems', payload);
        renderFoundItems();
        alert('Found Report Submitted Thank You');
        foundForm.reset();
      } catch (err) {
        console.error('Found submit failed:', err);
        saveToLocal('foundItems', payload);
        renderFoundItems();
        alert('Saved locally. Could not reach server: ' + (err.message || 'unknown error'));
      }
    });
    renderFoundItems();
  }

  const foundSearch = document.getElementById('foundSearch');
  if (foundSearch) {
    foundSearch.addEventListener('input', (e) => renderFoundItems(e.target.value));
  }

  const clearFoundBtn = document.getElementById('clearFound');
  if (clearFoundBtn) {
    clearFoundBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all found items?')) {
        clearLocal('foundItems');
        renderFoundItems();
        alert('Found items cleared.');
      }
    });
  }
});
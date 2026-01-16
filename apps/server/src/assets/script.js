// Format date as UTC string
function formatUTC(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, ' UTC');
}

async function loadCompanies() {
  try {
    const response = await fetch('/v1/company/all');
    const companies = await response.json();
    renderCompanies(companies);
  } catch (error) {
    console.error('Error loading companies:', error);
    document.getElementById('companiesList').innerHTML = `
      <div class="empty-state">
        <p>Error loading companies</p>
      </div>
    `;
  }
}

function renderCompanies(companies) {
  const container = document.getElementById('companiesList');

  if (!companies || companies.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No companies connected yet</p>
      </div>
    `;
    return;
  }

  container.innerHTML = companies
    .map(
      (company) => `
      <div class="company-item">
        <div><strong>Source ID:</strong> ${company.sourceId}</div>
        <div><strong>ID:</strong> ${company.id}</div>
        <div><strong>Created:</strong> ${formatUTC(company.createdAt)}</div>
        <div><strong>Access Token Expires:</strong> ${formatUTC(
          company.accessTokenExpiresAt
        )}</div>
        <div><strong>Refresh Token Expires:</strong> ${formatUTC(
          company.refreshTokenExpiresAt
        )}</div>
        <div class="company-actions">
          <button class="btn toggle-json-btn" data-company-id="${company.id}">
            Show JSON
          </button>
        </div>
        <div class="json-display" id="json-${company.id}">
${JSON.stringify(company, null, 2)}
        </div>
      </div>
    `
    )
    .join('');
}

// Toggle JSON display function
function toggleCompanyInfo(companyId, buttonElement) {
  const jsonDisplay = document.getElementById(`json-${companyId}`);
  const button = buttonElement;

  if (jsonDisplay && button) {
    const isVisible = jsonDisplay.classList.contains('show');
    jsonDisplay.classList.toggle('show');

    // Update button text based on new state (after toggle)
    button.textContent = isVisible ? 'Show JSON' : 'Hide JSON';
  }
}

// Use event delegation for toggle buttons (CSP-compliant)
// Attach listener to container - works for dynamically added content
const companiesList = document.getElementById('companiesList');
if (companiesList) {
  companiesList.addEventListener('click', function (event) {
    const button = event.target.closest('.toggle-json-btn');
    if (button) {
      const companyId = button.getAttribute('data-company-id');
      toggleCompanyInfo(companyId, button);
    }
  });
}

// Load companies on page load
loadCompanies();

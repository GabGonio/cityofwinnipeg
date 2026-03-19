const form = document.getElementById('searchForm');
const statusError = document.getElementById('statusError');
const resultsSection = document.getElementById('resultsSection');
const resultsCount = document.getElementById('resultsCount');
const tableCaption = document.getElementById('tableCaption');
const resultsBody = document.getElementById('resultsBody');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const commonName = document.getElementById('commonName').value.trim();

  clearError();

  if (commonName === '') {
    hideResultsSection();
    showError('Please enter a tree name before searching.');
    return;
  }

  searchTrees(commonName);
});

/**
 * Fetches the top 100 largest trees from the City of Winnipeg open dataset
 * whose common name contains the search term, then displays them in the table.
 *
 * @param {string} commonName - The tree name to search for.
 */
async function searchTrees(commonName) {
  resultsBody.innerHTML = '';
  resultsCount.textContent = 'Searching…';
  tableCaption.textContent = '';
  showResultsSection();

  const apiUrl =
    'https://data.winnipeg.ca/resource/d3jk-hb6j.json?' +
    `$where=lower(common_name) LIKE lower('%${commonName}%')` +
    '&$order=diameter_at_breast_height DESC' +
    '&$limit=100';

  const encodedURL = encodeURI(apiUrl);

  try {
    const response = await fetch(encodedURL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const trees = await response.json();

    displayResults(trees, commonName);
  } catch (error) {
    console.error(error);
    hideResultsSection();
    showError('Could not load data. Please check your connection and try again.');
  }
}

/**
 * Renders the fetched tree records into the results table.
 *
 * @param {Array} trees - Array of tree objects returned by the API.
 * @param {string} searchTerm - The search term entered by the user.
 */
function displayResults(trees, searchTerm) {
  if (trees.length === 0) {
    resultsCount.textContent = `No trees found matching "${searchTerm}".`;
    tableCaption.textContent = '';
    return;
  }

  resultsCount.textContent = `Found ${trees.length} trees matching "${searchTerm}":`;
  tableCaption.textContent = `Top ${trees.length} largest trees — sorted by diameter at breast height`;

  trees.forEach((tree, index) => {
    const row = document.createElement('tr');

    const cells = [
      String(index + 1),
      tree.common_name || 'N/A',
      tree.botanical_name || 'N/A',
      tree.diameter_at_breast_height || 'N/A',
      tree.neighbourhood || 'N/A',
      tree.electoral_ward || 'N/A',
      tree.street || 'N/A',
      tree.location_class || 'N/A',
      tree.park || 'N/A',
    ];

    cells.forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });

    resultsBody.appendChild(row);
  });
}

/**
 * Displays an error message to the user.
 *
 * @param {string} message - The error message to display.
 */
function showError(message) {
  statusError.textContent = message;
  statusError.classList.add('error-visible');
}

/**
 * Clears any currently visible error message.
 */
function clearError() {
  statusError.textContent = '';
  statusError.classList.remove('error-visible');
}

/**
 * Shows the results section after a search starts or completes.
 */
function showResultsSection() {
  resultsSection.style.display = 'block';
}

/**
 * Hides the results section when there is nothing useful to show.
 */
function hideResultsSection() {
  resultsSection.style.display = 'none';
}
